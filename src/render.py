import argparse
import json
from pathlib import Path
from io import StringIO
from typing import List, Optional, IO

import yaml
from tqdm import tqdm

from src import PROJECT_PATH
from src.s3m import S3m


def parseargs():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command", type=str,
        choices=["dump-readme", "readme", "web-index"],
    )

    return vars(parser.parse_args())


class Records:

    MODULE_PATH = Path(__file__).resolve().parent.parent / "MODULE"
    GITHUB_PATH = "https://raw.githubusercontent.com/defgsus/defgsus-music/master"

    def __init__(self):
        with (self.MODULE_PATH / "index.yml").open() as fp:
            self.records = yaml.safe_load(fp)

    def print_markdown(self, file: Optional[IO[str]] = None):
        for record in self.records:
            record_path = f'./MODULE/{record["path"]}'
            print(f'\n## [{record["name"]}]({record_path})\n', file=file)

            if record.get("graphics"):
                for filename in record["graphics"]:
                    print(f'[{filename.split(".")[0]}]({record_path}/{filename})', file=file)
                print(file=file)

            for track in record["tracks"]:
                name = track.get("name")
                if not name:
                    name = track["file"]

                true_filename = (
                    f'{self.GITHUB_PATH}/MODULE/{record["path"]}/{track["file"]}'
                )
                true_filename = true_filename.replace("(", r"\(").replace(")", r"\)")
                print(f'  - [{name}]({true_filename})', file=file)

            print(file=file)

    def web_index(self) -> dict:
        index = {
            "play_time": 0,
            "records": [],
        }
        for i, record in enumerate(tqdm(self.records, desc="records")):
            index_record = {
                **record,
                "tracks": [],
                "index": i,
            }
            for j, track in enumerate(record["tracks"]):
                module = S3m.from_file(self.MODULE_PATH / record["path"] / track["file"])
                instruments = []
                for inst_idx, inst in enumerate(module.instruments):
                    if inst.title:
                        instruments.append({
                            "index": inst_idx,
                            "name": inst.title,
                            "length": inst.length,
                        })
                    else:
                        if not instruments or instruments[-1]["name"]:
                            instruments.append({"index": inst_idx, "name": ""})

                length = track.get("length")
                if length:
                    while len(length) < 5:
                        length = f" {length}"
                else:
                    try:
                        sec = module.calc_length_ffmpeg()
                        length = f"{sec//60}:{sec%60:02}"
                    except RuntimeError:
                        length = "??:??"

                index_record["tracks"].append({
                    **track,
                    "index": j,
                    "record_index": i,
                    "length": length,
                    "instruments": instruments,
                })
                if not length.startswith("?"):
                    m, s = (int(i) for i in length.split(":"))
                    index["play_time"] += m * 60 + s

            index["records"].append(index_record)

        sec = index["play_time"]
        index["play_time"] = f"{sec//60}:{sec%60:02}"
        return index


def patch_readme(records: Records, write: bool = False):
    file = StringIO()
    records.print_markdown(file=file)
    file.seek(0)
    index = file.read()

    readme = Path("README.md").read_text()
    readme = readme[:readme.find("---------\n") + 10] + "\n" + index

    if not write:
        print(readme)
    else:
        Path("README.md").write_text(readme)


def main(command: str):
    records = Records()
    #for record in records.records:
    #    for track in record["tracks"]:
    #        if "(" in track["file"]:
    #            print(record["path"], track["file"])

    if command == "web-index":
        (PROJECT_PATH / "website" / "src" / "index.jsontxt").write_text(json.dumps(records.web_index()))

    elif command == "dump-readme":
        patch_readme(records)

    elif command == "readme":
        patch_readme(records, True)


if __name__ == "__main__":

    main(**parseargs())

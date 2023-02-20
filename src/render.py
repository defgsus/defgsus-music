import argparse
import json
from pathlib import Path
from io import StringIO
from typing import List, Optional, IO

import yaml
from tqdm import tqdm

from src import PROJECT_PATH, MODULE_PATH, GITHUB_PATH
from src.s3m import S3m


def parseargs():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command", type=str,
        choices=["dump-readme", "readme", "web-index"],
    )

    return vars(parser.parse_args())


def escape_md(s: str) -> str:
    chars = "()[]"
    for c in chars:
        s = s.replace(c, f"\\{c}")
    return s


def md_link(title: str, url: str) -> str:
    return f"[{escape_md(title)}]({escape_md(url)})"


def md_image(title: str, url: str) -> str:
    return f"!{md_link(title, url)}"


class Records:

    def __init__(self):
        with (MODULE_PATH / "index.yml").open() as fp:
            self.records = yaml.safe_load(fp)

    def print_readme(self, file: Optional[IO[str]] = None):
        for record in self.records:
            record_path = f'./MODULE/{record["path"]}'
            print(f'\n## {md_link(record["name"], record_path)}\n', file=file)

            if record.get("graphics"):
                for filename in record["graphics"]:
                    print(md_image(filename.split(".")[0], f"{record_path}/{filename}"), file=file)
                print(file=file)

            if record.get("description"):
                print("\n" + record["description"] + "\n", file=file)

            for track in record["tracks"]:
                name = track.get("name")
                if not name:
                    name = track["file"]

                true_filename = (
                    f'{GITHUB_PATH}/MODULE/{record["path"]}/{track["file"]}'
                )
                print(f'- {md_link(name, true_filename)}', file=file)

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
                module = S3m.from_file(MODULE_PATH / record["path"] / track["file"])
                instruments = []
                for inst_idx, inst in enumerate(module.instruments):
                    if inst.title:
                        instruments.append({
                            "index": inst_idx,
                            "name": inst.title.replace("\0", " "),
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
        index["play_time"] = f"{sec//60//60}h{(sec//60)%60:02}m{sec%60:02}s"
        return index


def patch_readme(records: Records, write: bool = False):
    file = StringIO()
    records.print_readme(file=file)
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

    if command == "web-index":
        (PROJECT_PATH / "website" / "src" / "index.jsontxt").write_text(json.dumps(records.web_index()))

    elif command == "dump-readme":
        patch_readme(records)

    elif command == "readme":
        patch_readme(records, True)


if __name__ == "__main__":

    main(**parseargs())

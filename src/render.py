import argparse
import json
from pathlib import Path
from typing import List, Optional, IO

import yaml

from src import PROJECT_PATH


def parseargs():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command", type=str,
        choices=["readme", "web-index"],
    )

    return vars(parser.parse_args())


class Records:

    MODULE_PATH = Path(__file__).resolve().parent.parent / "MODULE"

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
                    f'https://github.com/defgsus/defgsus-music/raw/master/MODULE/'
                    f'{record["path"]}/{track["file"]}'
                )
                true_filename = true_filename.replace("(", r"\(").replace(")", r"\)")
                print(f'  - [{name}]({true_filename})', file=file)

            print(file=file)


def main(command: str):
    records = Records()
    #for record in records.records:
    #    for track in record["tracks"]:
    #        if "(" in track["file"]:
    #            print(record["path"], track["file"])

    if command == "web-index":
        (PROJECT_PATH / "website" / "src" / "index.jsontxt").write_text(json.dumps(records.records))

    elif command == "readme":
        records.print_markdown()


if __name__ == "__main__":

    main(**parseargs())

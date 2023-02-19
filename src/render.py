import argparse
import json
from pathlib import Path
from io import StringIO
from typing import List, Optional, IO

import yaml

from src import PROJECT_PATH, MODULE_PATH


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


class Records:

    GITHUB_PATH = "https://raw.githubusercontent.com/defgsus/defgsus-music/master"

    def __init__(self):
        with (MODULE_PATH / "index.yml").open() as fp:
            self.records = yaml.safe_load(fp)

    def print_markdown(self, file: Optional[IO[str]] = None):
        for record in self.records:
            record_path = f'./MODULE/{record["path"]}'
            print(f'\n## [{record["name"]}]({record_path})\n', file=file)

            if record.get("graphics"):
                for filename in record["graphics"]:
                    print(f'![{escape_md(filename.split(".")[0])}]({record_path}/{escape_md(filename)})', file=file)
                print(file=file)

            if record.get("description"):
                print(f'\n{record["description"]}\n', file=file)

            for track in record["tracks"]:
                name = track.get("name")
                if not name:
                    name = track["file"]

                true_filename = (
                    f'{self.GITHUB_PATH}/MODULE/{record["path"]}/{track["file"]}'
                )
                print(f'- [{escape_md(name)}]({escape_md(true_filename)})', file=file)

            print(file=file)


def patch_readme(records: Records, write: bool = False):
    file = StringIO()
    records.print_markdown(file=file)
    file.seek(0)
    index = file.read()

    readme = (PROJECT_PATH / "README.md").read_text()
    readme = readme[:readme.find("---------\n") + 10] + "\n" + index

    if not write:
        print(readme)
    else:
        (PROJECT_PATH / "README.md").write_text(readme)


def main(command: str):
    records = Records()
    #for record in records.records:
    #    for track in record["tracks"]:
    #        if "(" in track["file"]:
    #            print(record["path"], track["file"])

    if command == "web-index":
        (PROJECT_PATH / "website" / "src" / "index.jsontxt").write_text(json.dumps(records.records))

    elif command == "dump-readme":
        patch_readme(records)

    elif command == "readme":
        patch_readme(records, True)


if __name__ == "__main__":

    main(**parseargs())

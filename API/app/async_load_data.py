from argparse import ArgumentParser
from pathlib import Path
from asyncio import run

from .DataBase import DataBase


parser = ArgumentParser("Database configuration parser")
parser.add_argument("--reset", action="store_true")
parser.add_argument("--file-name", nargs="?", dest="file_name", required=True)

async def main():
    args = parser.parse_args()
    reset, file_name = args.reset, args.file_name

    base_path = "app/data/"
    file_path = Path(base_path) / file_name
    if not file_path.is_file():
        raise ValueError(f"{file_path} is either missing or not a file.")
    
    if file_path.suffix != ".csv":
        raise ValueError("File extension is not '.csv'.")
    
    db = DataBase(is_sync=False)

    if reset:
        await db.reset()
    
    await db.load_data(file_path)

if __name__ == "__main__":
    run(main())
# FastAPi app
## Lounch
### app:
main command: <code>uv run -m app.main</code>

command line arguments:
-  <code>--sync</code> <b>-</b> launch app with sync database mode - connecting to temporal sqLite file, otherwise connecting to postgresSQL accordingly to data from .env file
-  <code>--reset</code> <b>-</b> reset database; automatically reset database when loading data
-  <code>--detail</code> <b>-</b> detail database queries
-  <code>--path</code> <b>-</b> path to data that you want to load to database  
-  <code>--log-path</code> <b>-</b> path to the log file

example: <code>uv run -m app.main --sync --detail --reset --path <<b>path_to_csv_file></b></code>
### tests:
main command: <code>uv run pytest app/tests/</code>
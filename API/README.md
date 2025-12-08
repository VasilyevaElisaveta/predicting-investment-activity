# FastAPi app

## Lounch

### app:
main command: <code>uv run -m app.main</code>
command line arguments:
- <code>---async</code> -- launch app with async database mode - connecting to postgreSQL
- <code>---reset</code> -- reset database; automatically reset database when loading data
- <code>---detail</code> -- detail database queries
- <code>---path</code> -- path to data that you want to load to database

example: <code>uv run -m app.main --async --detail --reset --path <path_to_csv_file></code>

### tests:
main command: <code>uv run pytest app/tests/</code>
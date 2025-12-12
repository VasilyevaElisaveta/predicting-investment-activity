FROM python:3.12-slim

WORKDIR /API

COPY uv.lock pyproject.toml .python-version .env data.csv ./

RUN pip install uv
RUN uv sync

COPY app ./app

CMD ["uv", "run", "-m", "app.main", "--reset", "--path", "data.csv"]
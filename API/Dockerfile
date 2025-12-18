FROM python:3.12-slim

WORKDIR /API

COPY uv.lock pyproject.toml .python-version ./

RUN pip install uv
RUN uv sync

COPY app ./app

CMD ["uv", "run", "-m", "app.main"]
import pytest
from fastapi.testclient import TestClient
from asyncio import run
from enum import IntEnum
from app.main import app, get_database
from app.Database import DataBase


class StatusCode(IntEnum):
    Success = 200
    NotFound = 404
    ValidationError = 422


class FakeDataBase:
    def __init__(self):

        self.db = DataBase(is_sync=True)
        run(self.db.reset())
        run(self.db.load_data("app/tests/test_data.csv"))


@pytest.fixture(scope="session")
def test_db():

    fake = FakeDataBase()
    yield fake.db
    fake.db.close()


@pytest.fixture(scope="session")
def client(test_db):

    def override_get_db():
        return test_db
    
    app.dependency_overrides[get_database] = override_get_db

    yield TestClient(app)

    app.dependency_overrides.clear()

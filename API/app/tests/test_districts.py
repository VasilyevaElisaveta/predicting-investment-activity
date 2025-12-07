from .testconf import StatusCode, client, test_db
from ..requestmodels import AreasResponse


class TestSuccessCases:

    def test_get_districts(self, client):

        response = client.get("/districts/")
        assert response.status_code == StatusCode.Success

        AreasResponse(**response.json())

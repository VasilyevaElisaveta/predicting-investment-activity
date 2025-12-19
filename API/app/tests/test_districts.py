from ..main import V1_PREFIX
from ..RequestModels import AreasResponse
from .testconf import StatusCode, client, test_db


class TestSuccessCases:

    def test_get_districts(self, client):

        response = client.get(f"{V1_PREFIX}/districts/")
        assert response.status_code == StatusCode.Success

        AreasResponse(**response.json())

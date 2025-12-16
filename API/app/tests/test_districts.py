from .testconf import StatusCode, client, test_db
from ..RequestModels import AreasResponse
from ..main import V1_PREFIX


class TestSuccessCases:

    def test_get_districts(self, client):

        response = client.get(f"{V1_PREFIX}/districts/")
        assert response.status_code == StatusCode.Success

        AreasResponse(**response.json())

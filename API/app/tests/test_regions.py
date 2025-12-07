from .testconf import StatusCode, client, test_db
from ..requestmodels import AreasResponse


class TestSuccessCases:

    def test_get_regions(self, client):

        response = client.get("/regions/")
        assert response.status_code == StatusCode.Success

        AreasResponse(**response.json())

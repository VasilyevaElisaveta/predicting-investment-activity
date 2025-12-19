from ..main import V1_PREFIX
from ..RequestModels import YearsResponse
from .testconf import StatusCode, client, test_db


class TestSuccessCases:

    def test_get_years(self, client):

        response = client.get(f"{V1_PREFIX}/years/")
        assert response.status_code == StatusCode.Success

        YearsResponse(**response.json())

from ..DataBase import MAX_YEAR, MIN_YEAR
from ..main import V1_PREFIX
from ..RequestModels import AvailableColumnsResponse
from .testconf import StatusCode, client, test_db

YEAR = 2018


class TestSuccessCases:

    def test_get_available_columns(self, client):

        response = client.get(f"{V1_PREFIX}/available-columns/?year={YEAR}")
        assert response.status_code == StatusCode.Success


class TestFailureCases:

    def test_no_year(self, client):

        response = client.get(f"{V1_PREFIX}/available-columns/")
        assert response.status_code == StatusCode.ValidationError

    def test_wrong_year(self, client):
        too_small_year = MIN_YEAR - 1
        too_large_year = MAX_YEAR + 1

        too_small_year_response = client.get(f"{V1_PREFIX}/available-columns/?year={too_small_year}")
        assert too_small_year_response.status_code == StatusCode.ValidationError

        too_large_year_response = client.get(f"{V1_PREFIX}/available-columns/?year={too_large_year}")
        assert too_large_year_response.status_code == StatusCode.ValidationError

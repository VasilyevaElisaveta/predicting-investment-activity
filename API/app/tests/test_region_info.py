from .testconf import StatusCode, client, test_db
from ..RequestModels import MIN_YEAR, MAX_YEAR, MIN_ID, RegionResponse
from ..main import V1_PREFIX


ID = 1
YEAR = 2018


class TestSuccessfulCases:

    def test_get_region_info(self, client):

        response = client.get(f"{V1_PREFIX}/region-info/?id={ID}&year={YEAR}")

        assert response.status_code == StatusCode.Success

        RegionResponse(**response.json())


class TestFailureCases:

    def test_data_lack(self, client):
        
        no_data_response = client.get(f"{V1_PREFIX}/region-info/")
        assert no_data_response.status_code == StatusCode.ValidationError

        no_id_response = client.get(f"{V1_PREFIX}/region-info/?year={YEAR}")
        assert no_id_response.status_code == StatusCode.ValidationError

        no_year_response = client.get(f"{V1_PREFIX}/region-info/?id={ID}")
        assert no_year_response.status_code == StatusCode.ValidationError

    def test_wrong_year_value(self, client):
        too_little_year = MIN_YEAR - 1
        too_big_year = MAX_YEAR + 1

        too_little_year_response = client.get(f"{V1_PREFIX}/region-info/?id={ID}&year={too_little_year}")
        assert too_little_year_response.status_code == StatusCode.ValidationError

        too_big_year_response = client.get(f"{V1_PREFIX}/region-info/?id={ID}&year={too_big_year}")
        assert too_big_year_response.status_code == StatusCode.ValidationError

    
    def test_wrong_id_value(self, client):
        too_little_id = MIN_ID - 1
        too_big_id = 99999

        too_little_id_response = client.get(f"{V1_PREFIX}/region-info/?id={too_little_id}&year={YEAR}")
        assert too_little_id_response.status_code == StatusCode.ValidationError

        too_big_id_response = client.get(f"{V1_PREFIX}/region-info/?id={too_big_id}&year={YEAR}")
        too_big_id_response.status_code == StatusCode.NotFound
        assert too_big_id_response.json()["detail"] == f"Region for id={too_big_id} and year={YEAR} not found"

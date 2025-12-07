from .testconf import StatusCode, client, test_db
from ..requestmodels import MIN_YEAR, MAX_YEAR, MIN_ID, DistrictResponse


ID = 1
YEAR = 2018
AGGREGATION_TYPE = "min"


class TestSuccessfulCases:

    def test_get_district_info(self, client):

        response = client.get(f"/district-info/?id={ID}&year={YEAR}&aggregation_type={AGGREGATION_TYPE}")

        assert response.status_code == StatusCode.Success

        DistrictResponse(**response.json())


class TestFailureCases:

    def test_data_lack(self, client):
        
        no_data_response = client.get("/district-info/")
        assert no_data_response.status_code == StatusCode.ValidationError

        no_id_response = client.get(f"/district-info/?year={YEAR}&aggregation_type={AGGREGATION_TYPE}")
        assert no_id_response.status_code == StatusCode.ValidationError

        no_year_response = client.get(f"/district-info/?id={ID}&aggregation_type={AGGREGATION_TYPE}")
        assert no_year_response.status_code == StatusCode.ValidationError

        no_aggregation_type_response = client.get(f"/district-info/?id={ID}&year={YEAR}")
        assert no_aggregation_type_response.status_code == StatusCode.ValidationError

    def test_wrong_year_value(self, client):
        too_little_year = MIN_YEAR - 1
        too_big_year = MAX_YEAR + 1

        too_little_year_response = client.get(f"/district-info/?id={ID}&year={too_little_year}&aggregation_type={AGGREGATION_TYPE}")
        assert too_little_year_response.status_code == StatusCode.ValidationError

        too_big_year_response = client.get(f"/district-info/?id={ID}&year={too_big_year}&aggregation_type={AGGREGATION_TYPE}")
        assert too_big_year_response.status_code == StatusCode.ValidationError

    
    def test_wrong_id_value(self, client):
        too_little_id = MIN_ID - 1
        too_big_id = 99999
        year = 2018

        too_little_id_response = client.get(f"/district-info/?id={too_little_id}&year={year}&aggregation_type={AGGREGATION_TYPE}")
        assert too_little_id_response.status_code == StatusCode.ValidationError

        too_big_id_response = client.get(f"/district-info/?id={too_big_id}&year={year}&aggregation_type={AGGREGATION_TYPE}")
        assert too_big_id_response.status_code == StatusCode.NotFound
        assert too_big_id_response.json()["detail"] == f"District for id={too_big_id} and year={year} not found"

    def test_wrong_aggregation_type(self, client):
        wrong_aggregation_type = "wrong"

        response = client.get(f"/district-info/?id={ID}&year={YEAR}&aggregation_type={wrong_aggregation_type}")
        assert response.status_code == StatusCode.ValidationError

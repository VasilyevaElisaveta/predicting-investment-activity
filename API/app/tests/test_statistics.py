from .testconf import StatusCode, client, test_db
from ..requestmodels import StatisticsResponse


REQUIRED_COLUMNS = [
    "investments",
    "grp",
    "population",
    "unemployment",
    "average_salary",
    "crimes",
    "retail_turnover",
    "cash_expenses",
    "scientific_research"
]
YEAR = 2019
IS_BY_DISTRICT = True
AGGREGATION_TYPE = "min"


class TestSuccessCases:
    
    def test_get_all_data(self, client):
        url = "/statistics/?"

        for column in REQUIRED_COLUMNS:
            url += f"required_columns={column}&"

        url += f"year={YEAR}&is_by_district={IS_BY_DISTRICT}&aggregation_type={AGGREGATION_TYPE}"

        all_data_response = client.get(url)
        assert all_data_response.status_code == StatusCode.Success

        StatisticsResponse(**all_data_response.json())

    def test_get_one_column_data(self, client):

        one_column_response = client.get(f"/statistics/?required_columns={REQUIRED_COLUMNS[0]}&year={YEAR}&is_by_district={IS_BY_DISTRICT}&aggregation_type={AGGREGATION_TYPE}")
        assert one_column_response.status_code == StatusCode.Success

        StatisticsResponse(**one_column_response.json())

    def test_get_data_by_region(self, client):

        by_region_response = client.get(f"/statistics/?required_columns={REQUIRED_COLUMNS[0]}&year={YEAR}")
        assert by_region_response.status_code == StatusCode.Success

        StatisticsResponse(**by_region_response.json())


class TestFailureCases:

    def test_data_lack(self, client):
        
        no_data_response = client.get("/statistics/")
        assert no_data_response.status_code == StatusCode.ValidationError

        no_columns_response = client.get(f"/feature-info/?year={YEAR}")
        assert no_columns_response.status_code == StatusCode.ValidationError

        no_year_response = client.get(f"/feature-info/?required_columns={REQUIRED_COLUMNS[0]}")
        assert no_year_response.status_code == StatusCode.ValidationError

        no_aggregation_type_response = client.get(f"/statistics/?required_columns={REQUIRED_COLUMNS[0]}&year={YEAR}&is_by_district={IS_BY_DISTRICT}")
        assert no_aggregation_type_response.status_code == StatusCode.ValidationError

    def test_wrong_aggregaion_type(self, client):
        wrong_aggregation_type = "wrong"

        response = client.get(f"/statistics/?required_columns={REQUIRED_COLUMNS[0]}&year={YEAR}&is_by_district={IS_BY_DISTRICT}&aggregation_type={wrong_aggregation_type}")
        assert response.status_code == StatusCode.ValidationError

    def test_wrong_clumn_name(self, client):
        wrong_column_name = "name"

        response = client.get(f"/statistics/?required_columns={wrong_column_name}&year={YEAR}")
        assert response.status_code == StatusCode.ValidationError

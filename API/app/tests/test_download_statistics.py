from ..DataBase import BORDER_YEAR
from ..main import V1_PREFIX
from .testconf import StatusCode, client, test_db

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
YEAR = 2018
IS_BY_DISTRICT = True
AGGREGATION_TYPE = "min"
FILE_EXTENSION = "csv"


class TestSuccessfulCases:

    def test_download(self, client):
        url = f"{V1_PREFIX}/download-statistics/?"

        for column in REQUIRED_COLUMNS:
            url += f"required_columns={column}&"

        url += (
            f"year={YEAR}&is_by_district={IS_BY_DISTRICT}&aggregation_type={AGGREGATION_TYPE}&file_extension={FILE_EXTENSION}"
        )
        response = client.get(url)

        assert response.status_code == 200
        assert "attachment" in response.headers["Content-Disposition"]
        assert response.headers["Content-Type"] == "text/csv; charset=utf-8"


class TestFailureCases:

    def test_data_lack(self, client):

        no_data_response = client.get(f"{V1_PREFIX}/download-statistics/")
        assert no_data_response.status_code == StatusCode.ValidationError

        no_columns_response = client.get(
            f"{V1_PREFIX}/download-statistics/?year={YEAR}&file_extension={FILE_EXTENSION}"
        )
        assert no_columns_response.status_code == StatusCode.ValidationError

        no_year_response = client.get(
            f"{V1_PREFIX}/download-statistics/?required_columns={REQUIRED_COLUMNS[0]}&file_extension={FILE_EXTENSION}"
        )
        assert no_year_response.status_code == StatusCode.ValidationError

        no_aggregation_type_response = client.get(
            f"{V1_PREFIX}/download-statistics/" \
                f"?required_columns={REQUIRED_COLUMNS[0]}&year={YEAR}" \
                f"&is_by_district={IS_BY_DISTRICT}&file_extension={FILE_EXTENSION}"
            )
        assert no_aggregation_type_response.status_code == StatusCode.ValidationError

        no_file_extension_response = client.get(
            f"{V1_PREFIX}/download-statistics/?required_columns={REQUIRED_COLUMNS[0]}&year={YEAR}"
        )
        assert no_file_extension_response.status_code == StatusCode.ValidationError

    def test_wrong_aggregaion_type(self, client):
        wrong_aggregation_type = "wrong"

        response = client.get(f"{V1_PREFIX}/download-statistics/" \
                              f"?required_columns={REQUIRED_COLUMNS[0]}&year={YEAR}" \
                              f"&is_by_district={IS_BY_DISTRICT}&aggregation_type={wrong_aggregation_type}" \
                              f"&file_extension={FILE_EXTENSION}")
        assert response.status_code == StatusCode.ValidationError

    def test_wrong_clumn_name(self, client):
        wrong_column_name = "wrong"
        wrong_column_name_by_border_year = REQUIRED_COLUMNS[-1]

        wrong_column_name_response = client.get(
            f"{V1_PREFIX}/download-statistics/" \
                f"?required_columns={wrong_column_name}&year={YEAR}&file_extension={FILE_EXTENSION}"
        )
        assert wrong_column_name_response.status_code == StatusCode.ValidationError

        wrong_column_name_by_border_year_response = client.get(
            f"{V1_PREFIX}/download-statistics/" \
                f"?required_columns={wrong_column_name_by_border_year}&year={BORDER_YEAR}&file_extension={FILE_EXTENSION}"
        )
        assert wrong_column_name_by_border_year_response.status_code == StatusCode.ValidationError

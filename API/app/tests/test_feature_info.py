from .testconf import StatusCode, client, test_db
from ..RequestModels import FeatureResponse, MIN_FILTER_VALUE as min_filter_value
from ..main import V1_PREFIX


FEATURE = "investments"
YEAR = 2019
IS_BY_DISTRICT = True
AGGREGATION_TYPE = "min"
USE_FILTER = True
MIN_FILTER_VALUE = 1
MAX_FILTER_VALUE = 99999999


class TestSuccessCases:
    
    def test_get_all_data(self, client):

        all_data_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&is_by_district={IS_BY_DISTRICT}&aggregation_type={AGGREGATION_TYPE}&use_filter={USE_FILTER}&min_filter_value={MIN_FILTER_VALUE}&max_filter_value={MAX_FILTER_VALUE}")
        assert all_data_response.status_code == StatusCode.Success

        FeatureResponse(**all_data_response.json())

    def test_get_data_without_filter(self, client):

        no_filter_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&is_by_district={IS_BY_DISTRICT}&aggregation_type={AGGREGATION_TYPE}")
        assert no_filter_response.status_code == StatusCode.Success

        FeatureResponse(**no_filter_response.json())

    def test_get_data_by_region(self, client):

        by_region_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}")
        assert by_region_response.status_code == StatusCode.Success

        FeatureResponse(**by_region_response.json())


class TestFailureCases:

    def test_data_lack(self, client):
        
        no_data_response = client.get(f"{V1_PREFIX}/feature-info/")
        assert no_data_response.status_code == StatusCode.ValidationError

        no_feature_response = client.get(f"{V1_PREFIX}/feature-info/?year={YEAR}")
        assert no_feature_response.status_code == StatusCode.ValidationError

        no_year_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}")
        assert no_year_response.status_code == StatusCode.ValidationError

        no_aggregation_type_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&is_by_district={IS_BY_DISTRICT}")
        assert no_aggregation_type_response.status_code == StatusCode.ValidationError

        no_filter_value_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&use_filter={USE_FILTER}")
        assert no_filter_value_response.status_code == StatusCode.ValidationError

    def test_wrong_aggregaion_type(self, client):
        wrong_aggregation_type = "wrong"

        response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&is_by_district={IS_BY_DISTRICT}&aggregation_type={wrong_aggregation_type}")
        assert response.status_code == StatusCode.ValidationError

    def test_wrong_filter_value(self, client):
        wrong_max_value = min_filter_value - 1
        wrong_min_value = min_filter_value - 1

        wrong_max_value_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&use_filter={USE_FILTER}&max_filter_value={wrong_max_value}")
        assert wrong_max_value_response.status_code == StatusCode.ValidationError

        wrong_min_value_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&use_filter={USE_FILTER}&min_filter_value={wrong_min_value}")
        assert wrong_min_value_response.status_code == StatusCode.ValidationError

        equal_values_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&use_filter={USE_FILTER}&min_filter_value={MIN_FILTER_VALUE}&max_filter_value={MIN_FILTER_VALUE}")
        assert equal_values_response.status_code == StatusCode.ValidationError

        no_possible_data_response = client.get(f"{V1_PREFIX}/feature-info/?feature={FEATURE}&year={YEAR}&use_filter={USE_FILTER}&min_filter_value={MIN_FILTER_VALUE}&max_filter_value={MIN_FILTER_VALUE + 1}")
        assert no_possible_data_response.status_code == StatusCode.NotFound

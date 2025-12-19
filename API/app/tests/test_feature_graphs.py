from ..main import V1_PREFIX
from ..RequestModels import FeatureGraphsResponse
from .testconf import StatusCode, client, test_db

AGGREGATION_TYPE = "min"


class TestSuccessCases:

    def test_get_feature_graphs(self, client):

        response = client.get(f"{V1_PREFIX}/feature-graphs/?aggregation_type={AGGREGATION_TYPE}")
        assert response.status_code == StatusCode.Success

        FeatureGraphsResponse(**response.json())


class TestFailureCases:

    def test_wrong_aggregation_type(self, client):
        wrong_aggregation_type = "wrong"

        response = client.get(f"{V1_PREFIX}/feature-graphs/?aggregation_type={wrong_aggregation_type}")
        assert response.status_code == StatusCode.ValidationError

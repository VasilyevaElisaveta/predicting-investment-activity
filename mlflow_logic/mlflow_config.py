import os
import mlflow
from dotenv import load_dotenv

load_dotenv()


class MLFlowConfig:
    @property
    def database_url(self):
        return os.getenv('MLFLOW_DATABASE_URL')

    def setup(self, experiment_name="Default"):
        mlflow.set_tracking_uri(os.getenv("MLFLOW_BACKEND_STORE_URI"))

        try:
            experiment = mlflow.get_experiment_by_name(experiment_name)
            if experiment is None:
                mlflow.create_experiment(
                    name=experiment_name,
                    artifact_location=os.getenv('MLFLOW_ARTIFACT_ROOT', './mlruns')
                )
                print(f"Создан эксперимент: {experiment_name}")
            else:
                print(f"Используем существующий эксперимент: {experiment_name}")

        except Exception as e:
            print(f"Предупреждение: {e}")

        mlflow.set_experiment(experiment_name)


team_config = MLFlowConfig()
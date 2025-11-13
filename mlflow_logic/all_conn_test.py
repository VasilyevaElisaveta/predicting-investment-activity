from mlflow_config import team_config
import mlflow
import os

def test_final():
    try:
        print(f" URL: {team_config.database_url}")

        team_config.setup(experiment_name="Final_Test_6")

        with mlflow.start_run(run_name="Real_Connection_Test"):
            mlflow.log_param("db_name", os.getenv('MLFLOW_DB_NAME'))
            mlflow.log_metric("success", 1.0)
            mlflow.set_tag("test", "real_render_connection")

            test_file_path = "test_artifact.txt"
            with open(test_file_path, "w") as f:
                f.write(";gsllglsflgs")

            mlflow.log_artifact(test_file_path, artifact_path="test_files")

            print(f"Файл '{test_file_path}' успешно залогирован как артефакт.")

        print("Результаты добавлены на Render PostgreSQL")

    except Exception as e:
        print(f" Ошибка: {e}")

if __name__ == "__main__":
    test_final()

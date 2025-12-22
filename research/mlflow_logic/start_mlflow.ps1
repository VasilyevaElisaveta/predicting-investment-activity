$envPath = ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value)
            Set-Item -Path Env:$name -Value $value
        }
    }
}

$env:MLFLOW_BACKEND_STORE_URI = "postgresql+psycopg2://$($env:MLFLOW_DB_USER):$($env:MLFLOW_DB_PASSWORD)@$($env:MLFLOW_DB_HOST):$($env:MLFLOW_DB_PORT)/$($env:MLFLOW_DB_NAME)?sslmode=require"
$env:MLFLOW_ARTIFACT_ROOT = "./mlruns"

mlflow ui

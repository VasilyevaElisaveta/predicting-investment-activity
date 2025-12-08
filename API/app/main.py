import uvicorn
from fastapi import FastAPI, Query, status, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from typing import Annotated

import argparse
from pathlib import Path
from io import StringIO
import pandas as pd

from .Database import DataBase

from .RequestModels import (
    RegionRequest, RegionResponse, 
    DistrictRequest, DistrictResponse,
    FeatureRequest, FeatureResponse,
    StaticticsRequest, StatisticsResponse,
    FeatureGraphsRequest, FeatureGraphsResponse,
    AreasResponse
)


async def get_database(request: Request) -> DataBase:
    return request.app.state.db


@asynccontextmanager
async def lifespan(app: FastAPI):
    parser = argparse.ArgumentParser("Database configuration parser")
    parser.add_argument("--sync", action="store_true")
    parser.add_argument("--reset", action="store_true")
    parser.add_argument("--detail", action="store_true")
    parser.add_argument("--path", nargs="?")
    args = parser.parse_args()
    is_sync, reset, detail, path = args.sync, args.reset, args.detail, args.path
    if path is not None:
        reset = True

    app.state.db = DataBase(is_sync=is_sync, reset=reset, detail=detail)

    if path is not None:
        file_path = Path(path)
        if not file_path.is_file():
            raise ValueError(f"{file_path} is either missing or not a file.")
        
        if file_path.suffix != ".csv":
            raise ValueError("File extension is not '.csv'.")
        
        await app.state.db.load_data(path)
    
    yield

    app.state.db.close()


app = FastAPI(lifespan=lifespan)


@app.get('/region-info/',
         description="Get overview statistics about the region by year",
         response_model=RegionResponse,
         status_code=status.HTTP_200_OK)
async def get_region_info(query_params: Annotated[RegionRequest, Query()], db: Annotated[DataBase, Depends(get_database)]):
    region = await db.get_region_info(
        id=query_params.id,
        year=query_params.year
    )
    if region is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region for id={query_params.id} and year={query_params.year} not found"
        )
    return region

@app.get('/district-info/',
         description="Get overview statistics about the district by year",
         response_model=DistrictResponse,
         status_code=status.HTTP_200_OK)
async def get_district_info(query_params: Annotated[DistrictRequest, Query()], db: Annotated[DataBase, Depends(get_database)]):
    district = await db.get_district_info(
        id=query_params.id,
        year=query_params.year,
        aggregation_type=query_params.aggregation_type
    )
    if district is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District for id={query_params.id} and year={query_params.year} not found"
        )
    return district

@app.get('/feature-info/',
         description="Get information about a specific feature by regions or districts",
         response_model=FeatureResponse,
         status_code=status.HTTP_200_OK)
async def get_feature_info(query_params: Annotated[FeatureRequest, Query()], db: Annotated[DataBase, Depends(get_database)]):
    features = await db.get_feature_info(
        feature=query_params.feature,
        year=query_params.year,
        is_by_district=query_params.is_by_district,
        aggregation_type=query_params.aggregation_type,
        use_filter=query_params.use_filter,
        min_value=query_params.min_filter_value,
        max_value=query_params.max_filter_value
    )
    if len(features) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No features by {"districts" if query_params.is_by_district else "regions"} found"
        )
    area_type = "district" if query_params.is_by_district else "region"
    return {"area_type": area_type, "features": features}

@app.get('/statistics/',
         description="Get overview statistics by regions or districts",
         response_model=StatisticsResponse,
         status_code=status.HTTP_200_OK)
async def get_statistics(query_params: Annotated[StaticticsRequest, Query()], db: Annotated[DataBase, Depends(get_database)]):
    data = await db.get_statistic(
        required_columns=query_params.required_columns,
        year=query_params.year,
        is_by_district=query_params.is_by_district,
        aggregation_type=query_params.aggregation_type
    )
    if len(data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="There is no data"
        )
    
    area_type = "district" if query_params.is_by_district else "region"
    table = {col_name: [] for col_name in data[0].keys()}
    for elem in data:
        for key, value in elem.items():
            table[key].append(value)

    return {"area_type": area_type, "table": table}

@app.get('/download-statistics/',
         description="Download overview statistics by regions or districts",
         status_code=status.HTTP_200_OK)
async def download_statistics(query_params: Annotated[StaticticsRequest, Query()], db: Annotated[DataBase, Depends(get_database)]):
    data = await db.get_statistic(
        required_columns=query_params.required_columns,
        year=query_params.year,
        is_by_district=query_params.is_by_district,
        aggregation_type=query_params.aggregation_type
    )
    if len(data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="There is no data"
        )
    
    table = {col_name: [] for col_name in data[0].keys()}
    for elem in data:
        for key, value in elem.items():
            table[key].append(value)

    buffer = StringIO()
    dataframe = pd.DataFrame(table)
    dataframe.to_csv(buffer, index=False, encoding="utf-8-sig")
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="statistics.csv"'
        }
    )


@app.get("/feature-graphs/",
         description="Get a graph of feature by year",
         response_model=FeatureGraphsResponse,
         status_code=status.HTTP_200_OK)
async def get_feature_graphs(query_params: Annotated[FeatureGraphsRequest, Query()], db: Annotated[DataBase, Depends(get_database)]):
    data = await db.get_feature_graphs(aggregation_type=query_params.aggregation_type)
    if len(data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="There is no data"
        )
    
    graphs = {col_name: [] for col_name in data[0].keys()}
    for elem in data:
        for key, value in elem.items():
            graphs[key].append(value)

    return {"graphs": graphs}

@app.get("/regions/",
         description="Get region names",
         response_model=AreasResponse,
         status_code=status.HTTP_200_OK)
async def get_region_names(db: Annotated[DataBase, Depends(get_database)]):
    areas = await db.get_areas()
    if len(areas) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="There is no regions")
    
    return {"areas": areas}

@app.get("/districts/",
         description="Get district names",
         response_model=AreasResponse,
         status_code=status.HTTP_200_OK)
async def get_district_names(db: Annotated[DataBase, Depends(get_database)]):
    areas = await db.get_areas(are_districts=True)
    if len(areas) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="There is no districts")
    
    return {"areas": areas}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

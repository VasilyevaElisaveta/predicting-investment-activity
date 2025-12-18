from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, and_, func

import pandas as pd
from tempfile import TemporaryDirectory
from pathlib import Path
from os import getenv
from dotenv import load_dotenv
from enum import StrEnum

from .DataBaseModels import Base, Statistics, Regions, Districts


current_path = Path(".")
env_file = current_path.resolve() / ".env"
load_dotenv(env_file)


class AggregationType(StrEnum):
    MIN = 'min'
    MAX = 'max'
    AVG = 'avg'
    SUM = 'sum'


class ColumnName(StrEnum):

    INVESTMENTS = "investments"
    GRP = "grp"
    POPULATION = "population"
    UNEMPLOYMENT = "unemployment"
    AVERAGE_SALARY = "average_salary"
    CRIMES = "crimes"
    RETAIL_TURNOVER = "retail_turnover"
    CASH_EXPENSES = "cash_expenses"
    SCIENTIFIC_RESEARCH = "scientific_research"


class AreaType(StrEnum):

    REGION = "region"
    DISTRICT = "district"


class DataBase:
    __SYNC_PATH_BASE = "sqlite:///"
    __ASYNC_PATH_BASE = "postgresql+asyncpg://"

    def __init__(self, is_sync: bool=True, detail: bool=False):
        self.__is_sync = is_sync
        if self.__is_sync:
            self.__temp_db_dir = TemporaryDirectory()
            self.__engine = create_engine(
                DataBase.__SYNC_PATH_BASE + self.__temp_db_dir.name + "/temp.db",
                echo=detail
            )
            self.__session = sessionmaker(self.__engine)
        else:
            user = getenv("POSTGRES_USER", "<Postgres user>")
            password = getenv("POSTGRES_PASSWORD", "<Postgres user password>")
            host = getenv("POSTGRES_HOST", "<Postgres host>")
            port = getenv("POSTGRES_PORT", "<Postgres port>")
            db = getenv("POSTGRES_DB", "<Postgres db>")
            self.__engine = create_async_engine(
                DataBase.__ASYNC_PATH_BASE + f"{user}:{password}@{host}:{port}/{db}",
                echo=detail
            )
            self.__session = async_sessionmaker(self.__engine)

    async def reset(self):
        if self.__is_sync:
            Base.metadata.drop_all(self.__engine)
            Base.metadata.create_all(self.__engine)
        else:
            async with self.__engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
                await conn.run_sync(Base.metadata.create_all)

    def close(self):
        self.__engine.dispose()

        if self.__is_sync:
            self.__temp_db_dir.cleanup()

    @staticmethod
    def __aggregate_feature(orm_feature, aggregation_type: str):
        aggregation_type = AggregationType(aggregation_type)
        if aggregation_type is AggregationType.SUM:
            return func.sum(orm_feature)
        elif aggregation_type is AggregationType.AVG:
            return func.avg(orm_feature)
        elif aggregation_type is AggregationType.MAX:
            return func.max(orm_feature)
        else:
            return func.min(orm_feature)
        
    def __exec_sync(self, query):
        with self.__session() as session:
            return session.execute(query)
        
    async def __exec_async(self, query):
        async with self.__session() as session:
            return await session.execute(query)
        
    async def __exec_query(self, query):
        if self.__is_sync:
            return self.__exec_sync(query)
        return await self.__exec_async(query)     
        
    async def load_data(self, path: str):
        """
        Load data into the database from a CSV file with columns:
        Округ, 
        Регион,
        Год,
        Инвестиции,
        ВРП,
        Население,
        Безработица,
        Средняя_ЗП,
        Преступления,
        Оборот_розницы,
        Денежные_доходы,
        Научные_исследования
        
        Args:
            path (str): Path to CSV file
        """
        df = pd.read_csv(path)

        statistic_instances = []
        region_instances = []
        district_instances = []
        regions = {}
        districts = {}
        new_region_id = 1
        new_district_id = 1
        prev_region = None
        prev_region_id = None
        prev_district = None
        prev_district_id = None
        for row in df.itertuples():
            district = row.Округ
            region = row.Регион

            if district != prev_district:
                if district in districts:
                    district_id = districts[district]
                else:
                    districts[district] = new_district_id
                    district_id = new_district_id
                    new_district_id += 1

                    district_instances.append(Districts(district_name=district))
                
                prev_district = district
                prev_district_id = district_id
            else:
                district_id = prev_district_id

            if region != prev_region:
                if region in regions:
                    region_id = regions[region]
                else:
                    regions[region] = new_region_id
                    region_id = new_region_id
                    new_region_id += 1

                    region_instances.append(Regions(region_name=region))
                
                prev_region = region
                prev_region_id = region_id
            else:
                region_id = prev_region_id

            obj = Statistics(
                district_id=district_id,
                region_id=region_id,
                year=row.Год,
                investments=row.Инвестиции,
                grp=row.ВРП,
                population=row.Население,
                unemployment=row.Безработица,
                average_salary=row.Средняя_ЗП,
                crimes=row.Преступления,
                retail_turnover=row.Оборот_розницы,
                cash_expenses=row.Денежные_доходы,
                scientific_research=row.Научные_исследования
            )
            statistic_instances.append(obj)

        if self.__is_sync:
            with self.__session() as session:
                session.add_all(region_instances)
                session.add_all(district_instances)
                session.add_all(statistic_instances)

                session.commit()
        else:
            async with self.__session() as session:
                session.add_all(region_instances)
                session.add_all(district_instances)
                session.add_all(statistic_instances)

                await session.commit()

    @staticmethod
    def __get_region_info_query(id: int, year: int):
        columns = [getattr(Statistics, col.value) for col in ColumnName]
        return (
                select(Regions.region_name, Districts.district_name, *columns)
                .filter(Statistics.region_id==id, Statistics.year==year)
                .join(Regions, Regions.id == Statistics.region_id)
                .join(Districts, Districts.id == Statistics.district_id)
            )

    async def get_region_info(self, id: int, year: int) -> dict[str, str | int| float] | None:
        query = DataBase.__get_region_info_query(id, year)
        result = await self.__exec_query(query)
        try:
            return result.mappings().one()
        except:
            return None
        
    @staticmethod
    def __get_district_info_query(id: int, year: int, aggregation_type: str):
        columns = [(col, getattr(Statistics, col.value)) for col in ColumnName]
        aggr_columns = [DataBase.__aggregate_feature(orm_col, aggregation_type).label(col_name) for col_name, orm_col in columns]
        
        return (
                select(Districts.district_name, *aggr_columns)
                .select_from(Statistics)
                .filter_by(district_id=id, year=year)
                .join(Districts, Districts.id == Statistics.district_id)
                .group_by(Statistics.district_id, Districts.district_name)
            )

    async def get_district_info(self, id: int, year: int, aggregation_type: str) -> dict[str, str | int| float] | None:
        query = DataBase.__get_district_info_query(id, year, aggregation_type)
        result = await self.__exec_query(query)
        try:
            return result.mappings().one()
        except:
            return None
        
    @staticmethod
    def __get_feature_info_query(feature: str, year: int, is_by_district: bool,
                                 aggregation_type: str, use_filter: bool,
                                 min_value: int, max_value: int):
        orm_feature = getattr(Statistics, feature)

        if is_by_district:
            arrg_orm_feature = DataBase.__aggregate_feature(orm_feature, aggregation_type)
            sub_query = (
                select(
                    Statistics.district_id.label("area_id"),
                    Districts.district_name.label("area_name"),
                    Statistics.year,
                    arrg_orm_feature.label("feature_value")
                )
                .group_by(Statistics.district_id, Districts.district_name, Statistics.year)
                .join(Districts, Districts.id == Statistics.district_id)
            )
        else:
            sub_query = (
                select(
                    Statistics.region_id.label("area_id"),
                    Regions.region_name.label("area_name"),
                    Statistics.year,
                    orm_feature.label("feature_value")
                )
                .join(Regions, Regions.id == Statistics.region_id)
            )

        if use_filter:
            if is_by_district:
                if min_value is not None:
                    sub_query = (
                        sub_query
                        .having(
                            arrg_orm_feature >= min_value
                        )
                    )
                
                if max_value is not None:
                    sub_query = (
                        sub_query
                        .having(
                            arrg_orm_feature <= max_value
                        )
                    )
            else:
                if min_value is not None:
                    sub_query = sub_query.filter(
                        and_(
                            orm_feature >= min_value
                        )
                    )
                
                if max_value is not None:
                    sub_query = sub_query.filter(
                        and_(
                            orm_feature <= max_value
                        )
                    )
        sub_query = sub_query.subquery()

        prev_feature = func.lag(sub_query.c["feature_value"]).over(partition_by=sub_query.c.area_name, order_by=sub_query.c.year)

        windowed_sub_query = (
            select(
                sub_query.c["area_id", "area_name", "feature_value", "year"],
                (((sub_query.c["feature_value"] / prev_feature) - 1) * 100).label("feature_ratio")
                ).subquery()
        )
    
        return (
            select(windowed_sub_query.c["area_id", "area_name", "feature_value", "feature_ratio"])
            .filter_by(year=year)
            .order_by(windowed_sub_query.c.area_id)
        )

    async def get_feature_info(
            self,
            feature: str,
            year: int,
            is_by_district: bool,
            aggregation_type: str,
            use_filter: bool,
            min_value: int,
            max_value: int
        ) -> tuple[str, list[dict[str, str | float]]]:
        query = DataBase.__get_feature_info_query(feature, year, is_by_district, aggregation_type, use_filter, min_value, max_value)
        result = await self.__exec_query(query)
        return result.mappings().all()
    
    @staticmethod
    def __get_statistics_query(required_columns: list[str], year: int, is_by_district: bool=False, aggregation_type: str=None):
        if is_by_district:
            columns = [(col, getattr(Statistics, col)) for col in required_columns]
            aggr_columns = [DataBase.__aggregate_feature(orm_col, aggregation_type).label(col_name) for col_name, orm_col in columns]

            query = (
                select(
                    Districts.district_name.label("district_names"),
                    *aggr_columns
                )
                .select_from(Statistics) 
                .join(Districts, Districts.id == Statistics.district_id)
                .filter(Statistics.year == year)
                .group_by(Statistics.district_id, Districts.district_name)
            )
        else:
            columns = [getattr(Statistics, col) for col in required_columns]

            query = (
                select(
                    Districts.district_name.label("district_names"),
                    Regions.region_name.label("region_names"),
                    *columns
                )
                .select_from(Statistics) 
                .join(Regions, Regions.id == Statistics.region_id)
                .join(Districts, Districts.id == Statistics.district_id)
                .filter(Statistics.year == year)
            )
        
        return query


    async def get_statistic(
            self,
            required_columns: list[str],
            year: int,
            is_by_district: bool=False,
            aggregation_type: str=None
        ) -> list[dict[str, str | float]]:
        query = DataBase.__get_statistics_query(required_columns, year, is_by_district, aggregation_type)
        result = await self.__exec_query(query)
        return result.mappings().all()
    
    @staticmethod
    def __get_feature_graphs_query(aggregation_type: str):
        columns = [(col, getattr(Statistics, col.value)) for col in ColumnName]
        aggr_columns = [DataBase.__aggregate_feature(orm_col, aggregation_type).label(col_name) for col_name, orm_col in columns]
            
        return (
            select(
                Statistics.year,
                *aggr_columns
            )
            .group_by(Statistics.year)
            .order_by(Statistics.year.asc())
        )

    async def get_feature_graphs(self, aggregation_type: str='avg') -> list[dict[str, int | float]]:
        query = DataBase.__get_feature_graphs_query(aggregation_type)
        result = await self.__exec_query(query)
        return result.mappings().all()
    
    @staticmethod
    def __get_areas_query(are_districts: bool):
        if are_districts:
            return select(Districts.id, Districts.district_name.label("area_name"))
        return select(Regions.id, Regions.region_name.label("area_name"))
        
    async def get_areas(self, are_districts: bool=False) -> list[dict[str, int | str]]:
        query = DataBase.__get_areas_query(are_districts)
        result = await self.__exec_query(query)
        return result.mappings().all()
    
    @staticmethod
    def __get_years_query():
        return select(Statistics.year).distinct().order_by(Statistics.year.asc())
    
    async def get_years(self):
        query = DataBase.__get_years_query()
        result = await self.__exec_query(query)
        return result.scalars().all()

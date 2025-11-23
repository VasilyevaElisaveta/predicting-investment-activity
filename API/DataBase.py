from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, and_, func

import pandas as pd

from DataBaseModels import Base, Statistics, Regions, Districts

from enum import StrEnum


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


class SQLiteORM:

    def __init__(self, reset: bool=False, detail: bool=False):
        self.__engine = create_engine("sqlite:///API/regions.db", echo=detail)
        self.__sync_session = sessionmaker(self.__engine)

        if reset:
            Base.metadata.drop_all(self.__engine)
            Base.metadata.create_all(self.__engine)

    def close(self):
        self.__engine.dispose()

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
        
    def load_data(self, path: str):
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
        with self.__sync_session() as session:
            instances = []
            prev_region = None
            prev_region_id = None
            prev_district = None
            prev_district_id = None
            for row in df.itertuples():
                district = row.Округ
                region = row.Регион

                if district != prev_district:
                    current_districts = session.execute(select(Districts.id, Districts.district_name)).mappings().all()
                    for obj in current_districts:
                        if obj['district_name'] == district:
                            district_id = obj['id']
                            break
                    else:
                        session.add(Districts(district_name=district))
                        session.commit()

                        district_id = session.execute(select(Districts.id).filter_by(district_name=district)).mappings().one()['id']
                    
                    prev_district = district
                    prev_district_id = district_id
                else:
                    district_id = prev_district_id

                if region != prev_region:
                    current_region = session.execute(select(Regions.id, Regions.region_name)).mappings().all()
                    for obj in current_region:
                        if obj['region_name'] == region:
                            region_id = obj['id']
                            break
                    else:
                        session.add(Regions(region_name=region))
                        session.commit()

                        region_id = session.execute(select(Regions.id).filter_by(region_name=region)).mappings().one()['id']
                    
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
                instances.append(obj)
            session.add_all(instances)
            session.commit()

    def get_region_info(self, id: int, year: int) -> dict[str, str | int| float] | None:

        columns = [getattr(Statistics, col.value) for col in ColumnName]
        with self.__sync_session() as session:
            query = (
                select(Regions.region_name, Districts.district_name, *columns)
                .filter(Statistics.region_id==id, Statistics.year==year)
                .join(Regions, Regions.id == Statistics.region_id)
                .join(Districts, Districts.id == Statistics.district_id)
            )
            try:
                result = session.execute(query).mappings().one()
            except:
                result = None
            return result

    def get_district_info(self, id: int, year: int, aggregation_type: str) -> dict[str, str | int| float] | None:
        columns = [(col, getattr(Statistics, col.value)) for col in ColumnName]
        aggr_columns = [SQLiteORM.__aggregate_feature(orm_col, aggregation_type).label(col_name) for col_name, orm_col in columns]

        with self.__sync_session() as session:
            query = (
                select(Districts.district_name, *aggr_columns)
                .filter_by(district_id=id, year=year)
                .join(Districts, Districts.id == Statistics.district_id)
                .group_by(Statistics.district_id)
            )
            try:
                result = session.execute(query).mappings().one()
            except:
                result = None
            
            return result

    def get_feature_info(
            self,
            feature: str,
            year: int,
            is_by_district: bool,
            aggregation_type: str,
            use_filter: bool,
            min_value: int,
            max_value: int
        ) -> tuple[str, list[dict[str, str | float]]]:

        with self.__sync_session() as session:
            orm_feature = getattr(Statistics, feature)

            if is_by_district:
                arrg_orm_feature = SQLiteORM.__aggregate_feature(orm_feature, aggregation_type)
                sub_query = (
                    select(
                        Statistics.district_id.label("area_id"),
                        Districts.district_name.label("area_name"),
                        Statistics.year,
                        arrg_orm_feature.label("feature_value")
                    )
                    .group_by(Statistics.district_id, Statistics.year)
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
        
            query = (
                select(windowed_sub_query.c["area_id", "area_name", "feature_value", "feature_ratio"])
                .filter_by(year=year)
                .order_by(windowed_sub_query.c.area_id)
            )
            result = session.execute(query).mappings().all()

            return result

    def get_statistic(
            self,
            required_columns: list[str],
            year: int,
            is_by_district: bool=False,
            aggregation_type: str=None
        ) -> list[dict[str, str | float]]:

        with self.__sync_session() as session:
            if is_by_district:
                columns = [(col, getattr(Statistics, col)) for col in required_columns]
                aggr_columns = [SQLiteORM.__aggregate_feature(orm_col, aggregation_type).label(col_name) for col_name, orm_col in columns]

                query = (
                    select(
                        Districts.district_name.label("district_names"),
                        *aggr_columns
                    )
                    .select_from(Statistics) 
                    .join(Districts, Districts.id == Statistics.district_id)
                    .filter(Statistics.year == year)
                    .group_by(Statistics.district_id)
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
            
            result = session.execute(query).mappings().all()
            return result

    def get_feature_graphs(self, aggregation_type: str='avg') -> list[dict[str, int | float]]:

        with self.__sync_session() as session:
            columns = [(col, getattr(Statistics, col.value)) for col in ColumnName]
            aggr_columns = [SQLiteORM.__aggregate_feature(orm_col, aggregation_type).label(col_name) for col_name, orm_col in columns]
            
            query = (
                select(
                    Statistics.year,
                    *aggr_columns
                )
                .group_by(Statistics.year)
            )
            result = session.execute(query).mappings().all()
            return result
        
    def get_areas(self, are_districts: bool=False) -> list[dict[str, int | str]]:
        with self.__sync_session() as session:
            if are_districts:
                query = select(Districts.id, Districts.district_name.label("area_name"))
            else:
                query = select(Regions.id, Regions.region_name.label("area_name"))
            result = session.execute(query).mappings().all()
            return result

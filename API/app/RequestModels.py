from pydantic import BaseModel, Field, model_validator

from .DataBase import AggregationType, ColumnName, AreaType

from typing import Self


MIN_YEAR = 2018
MAX_YEAR = 2022

MIN_FILTER_VALUE = 0


class RegionRequest(BaseModel):

    model_config = {"extra": "forbid"}

    id: int = Field(
        ge=1,
        title="Region ID",
    )
    year: int = Field(
        ge=MIN_YEAR,
        le=MAX_YEAR
    )


class DistrictRequest(BaseModel):

    model_config = {"extra": "forbid"}

    id: int = Field(
        ge=1,
        title="District ID",
    )
    year: int = Field(
        ge=MIN_YEAR,
        le=MAX_YEAR
    )
    aggregation_type: AggregationType = Field(
        title="Aggregation type"
    )


class DistrictResponse(BaseModel):

    investments: float
    grp: float
    population: int
    unemployment: float
    average_salary: float = Field(
        title="Average salary"
    )
    crimes: float
    retail_turnover: float = Field(
        title="Retail turnover"
    )
    cash_expenses: float = Field(
        title="Cash expenses"
    )
    scientific_research: float = Field(
        title="Scientific research"
    )
    district_name: str = Field(
        title="District name"
    )


class RegionResponse(DistrictResponse):
    region_name: str


class FeatureRequest(BaseModel):

    model_config = {"extra": "forbid"}

    feature: ColumnName
    year: int = Field(
        le=MAX_YEAR,
        ge=MIN_YEAR
    )
    is_by_district: bool = Field(
        default=False,
        title="Is selection by district"
    )
    aggregation_type: AggregationType | None = Field(
        default=None,
        title="Aggregation type"
    )
    use_filter: bool = Field(
        default=False,
        title="Use filter for features"
    )
    min_filter_value: int | None = Field(
        default=None,
        ge=MIN_FILTER_VALUE,
        title="Min filter value"
    )
    max_filter_value: int | None = Field(
        default=None,
        ge=MIN_FILTER_VALUE,
        title="Max filter value"
    )

    @model_validator(mode="after")
    def validate_aggregation(self) -> Self:
        if not self.is_by_district:
            return self
        
        if self.aggregation_type is None:
            raise ValueError("Aggregation type is required, if you use selection by district.")
        
        return self
    
    @model_validator(mode="after")
    def validate_filtration(self) -> Self:
        if not self.use_filter:
            return self
        
        if self.min_filter_value is None and self.max_filter_value is None:
            raise ValueError("At least one of filtration values is required, if you use filtration.")
        
        if self.min_filter_value is not None and self.max_filter_value is not None:
            if self.max_filter_value <= self.min_filter_value:
                raise ValueError("The max filter value must be greater than the min filter value.")
            
        return self
    

class FeatureObject(BaseModel):

    area_id: int = Field(
        title="Area ID"
    )
    area_name: str = Field(
        title="Area name"
    )
    feature_value: float = Field(
        title="Feature value"
    )
    feature_ratio: float = Field(
        title="Feature ratio"
    )


class FeatureResponse(BaseModel):

    area_type: AreaType = Field(
        title="Area type"
    )
    features: list[FeatureObject] = Field(
        title="Features list"
    )


class StaticticsRequest(BaseModel):
    
    model_config = {"extra": "forbid"}

    required_columns: list[ColumnName] = Field(
        title="Required columns"
    )
    year: int = Field(
        ge=MIN_YEAR,
        le=MAX_YEAR
    )
    is_by_district: bool = Field(
        default=False,
        title="Is selection by district"
    )
    aggregation_type: AggregationType | None = Field(
        default=None,
        title="Aggregation type"
    )

    @model_validator(mode="after")
    def validate_aggregation(self) -> Self:
        if not self.is_by_district:
            return self
        
        if self.aggregation_type is None:
            raise ValueError("Aggregation type is required, if you use selection by district.")
        
        return self
    

class DistrictsTable(BaseModel):
    investments: list[float] | None = Field(
        default=None,
        title="Investments list"
    )
    grp: list[float] | None = Field(
        default=None,
        title="GRP list"
    )
    population: list[int] | None = Field(
        default=None,
        title="Population list"
    )
    unemployment: list[float] | None = Field(
        default=None,
        title="Unemployment list"
    )
    average_salary: list[float] | None = Field(
        default=None,
        title="Average salary list"
    )
    crimes: list[float] | None = Field(
        default=None,
        title="Crimes list"
    )
    retail_turnover: list[float] | None = Field(
        default=None,
        title="Retail turnover list"
    )
    cash_expenses: list[float] | None = Field(
        default=None,
        title="Cash expenses list"
    )
    scientific_research: list[float] | None = Field(
        default=None,
        title="Scientific research list"
    )
    district_names: list[str] = Field(
        title="District names list"
    )


class RegionsTable(DistrictsTable):
    region_names: list[str] | None = Field(
        default=None,
        title="Region names list"
    )


class StatisticsResponse(BaseModel):
    
    area_type: AreaType = Field(
        title="Area type"
    )
    table: RegionsTable | DistrictsTable


class FeatureGraphsRequest(BaseModel):

    model_config = {"extra": "forbid"}

    aggregation_type: AggregationType = Field(
        title="Aggregation type"
    )


class GraphObject(BaseModel):

    year: list[int] = Field(
        title="Years list"
    )
    investments: list[float] = Field(
        title="Investments list"
    )
    grp: list[float] = Field(
        title="GRP list"
    )
    population: list[int] = Field(
        title="Population list"
    )
    unemployment: list[float] = Field(
        title="Unemployment list"
    )
    average_salary: list[float] = Field(
        title="Average salary list"
    )
    crimes: list[float] = Field(
        title="Crimes list"
    )
    retail_turnover: list[float] = Field(
        title="Retail turnover list"
    )
    cash_expenses: list[float] = Field(
        title="Cash expenses list"
    )
    scientific_research: list[float] = Field(
        title="Scientific research list"
    )


class FeatureGraphsResponse(BaseModel):
    
    graphs: GraphObject


class AreaObject(BaseModel):

    id: int
    area_name: str = Field(
        title="Area name"
    )


class AreasResponse(BaseModel):
    
    areas: list[AreaObject]

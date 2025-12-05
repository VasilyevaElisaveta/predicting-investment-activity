from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import ForeignKey, String


class Base(DeclarativeBase):
    pass


class Statistics(Base):

    __tablename__ = 'statistics'

    id: Mapped[int] = mapped_column(primary_key=True)
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"))
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id", ondelete='CASCADE'))
    year: Mapped[int]
    investments: Mapped[float]
    grp: Mapped[float]
    population: Mapped[int]
    unemployment: Mapped[float]
    average_salary: Mapped[float]
    crimes: Mapped[float]
    retail_turnover: Mapped[float]
    cash_expenses: Mapped[float]
    scientific_research: Mapped[float]


class Regions(Base):
    
    __tablename__ = 'regions'

    id: Mapped[int] = mapped_column(primary_key=True)
    region_name: Mapped[str] = mapped_column(String(64))


class Districts(Base):

    __tablename__ = 'districts'

    id: Mapped[int] = mapped_column(primary_key=True)
    district_name: Mapped[str] = mapped_column(String(64))
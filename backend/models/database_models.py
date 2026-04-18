from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from database import Base


class SKU(Base):
    __tablename__ = "skus"

    id = Column(Integer, primary_key=True)
    item_number = Column(String, unique=True, nullable=False)
    sku_id = Column(String)
    long_description = Column(Text)
    primary_color = Column(String)
    marketing_color = Column(String)
    hierarchy = Column(String)
    taxonomy_path = Column(Text)
    image_link = Column(String)
    light_data = Column(JSONB)
    full_data = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True)
    sku_id = Column(String)
    item_number = Column(String)
    product_name = Column(String)
    composite_score = Column(Float)
    verdict = Column(String)
    score_breakdown = Column(JSONB)
    verdict_note = Column(Text)
    triggered_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# backend/app/models.py
from pydantic import BaseModel, Field
from typing import Optional

class Wine(BaseModel):
    name_ko: str = Field(..., description="와인 이름 (한국어)")
    name_en: str = Field(..., description="와인 이름 (영어)")
    wine_type: str = Field(..., description="와인 종류")
    winery: str = Field(..., description="양조장")
    country: str = Field(..., description="생산국")
    region: str = Field(..., description="생산 지역")
    price: float = Field(..., ge=0, description="가격")
    sweetness: int = Field(..., ge=1, le=5, description="당도")
    acidity: int = Field(..., ge=1, le=5, description="산도")
    body: int = Field(..., ge=1, le=5, description="바디감")
    tannin: int = Field(..., ge=1, le=5, description="타닌")
    aroma: str = Field(..., description="아로마")
    food_matching: str = Field(..., description="음식 페어링")
    image_url: Optional[str] = Field(None, description="이미지 URL")
    detail_url: Optional[str] = Field(None, description="세부 정보 URL")
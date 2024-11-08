# backend/app/models.py
from pydantic import BaseModel
from typing import Optional

class Wine(BaseModel):
    name_ko: str
    name_en: str
    winery: str
    country: str
    region: str
    wine_type: str
    price: Optional[int]
    sweetness: int
    acidity: int
    body: int
    tannin: int
    aroma: str
    food_matching: str
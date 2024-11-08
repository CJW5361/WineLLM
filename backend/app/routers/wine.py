# backend/app/routers/wine.py
from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Wine
from app.database import wine_db

router = APIRouter(prefix="/api/wines", tags=["wines"])

@router.get("/", response_model=List[Wine])
async def get_wines():
    return wine_db.get_all_wines()

@router.get("/search/{query}", response_model=List[Wine])
async def search_wines(query: str):
    wines = wine_db.search_wines(query)
    if not wines:
        raise HTTPException(status_code=404, detail="No wines found")
    return wines
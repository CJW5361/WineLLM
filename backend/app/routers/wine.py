# backend/app/routers/wine.py
from fastapi import APIRouter, HTTPException
from typing import List
from app.models import Wine
from app.vector_store import get_vector_store

router = APIRouter(prefix="/api/wines", tags=["wines"])

@router.get("/", response_model=List[Wine])
async def get_wines():
    vector_store = await get_vector_store()
    docs = vector_store.similarity_search("", k=100)  # 전체 와인 가져오기
    wines = []
    for doc in docs:
        try:
            wine_data = doc.metadata
            wine = Wine(**wine_data)
            wines.append(wine)
        except Exception as e:
            continue
    return wines

@router.get("/search/{query}", response_model=List[Wine])
async def search_wines(query: str):
    vector_store = await get_vector_store()
    docs = vector_store.similarity_search(query, k=10)
    wines = []
    for doc in docs:
        try:
            wine_data = doc.metadata
            wine = Wine(**wine_data)
            wines.append(wine)
        except Exception as e:
            continue
    if not wines:
        raise HTTPException(status_code=404, detail="No wines found")
    return wines
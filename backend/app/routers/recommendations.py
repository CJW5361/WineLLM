from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.vector_store import get_vector_store
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

class PreferencesRequest(BaseModel):
    preferred_sweetness: int = Field(..., ge=1, le=5, description="선호하는 당도 (1-5)")
    preferred_acidity: int = Field(..., ge=1, le=5, description="선호하는 산도 (1-5)")
    preferred_body: int = Field(..., ge=1, le=5, description="선호하는 바디감 (1-5)")
    preferred_tannin: int = Field(..., ge=1, le=5, description="선호하는 타닌 (1-5)")
    preferred_types: list[str] = Field(
        ..., 
        description="선호하는 와인 종류",
        example=["레드", "화이트", "스파클링"]
    )
    price_range: tuple[int, int] = Field(
        default=(0, 1000000),
        description="가격 범위 (최소, 최대)"
    )

@router.post("/test")
async def test_recommendations(preferences: PreferencesRequest):
    try:
        vector_store = await get_vector_store()
        
        search_query = f"""
        당도: {preferences.preferred_sweetness}
        산도: {preferences.preferred_acidity}
        바디: {preferences.preferred_body}
        타닌: {preferences.preferred_tannin}
        종류: {', '.join(preferences.preferred_types)}
        """
        
        # similarity_search를 비동기로 호출
        docs = vector_store.similarity_search(search_query, k=10)
        
        # 중복 제거 (name_ko 기준)
        from app.routers.chat import process_wine_data
        wines = process_wine_data(docs)
        
        # 중복 제거 및 가격 필터링
        unique_wines = []
        seen_names = set()
        
        for wine in wines:
            name = wine['name_ko']
            if name not in seen_names:
                if preferences.price_range[0] <= (wine['price'] or 0) <= preferences.price_range[1]:
                    seen_names.add(name)
                    unique_wines.append(wine)
        
        logger.info(f"Found {len(unique_wines)} unique matching wines")
        
        return {
            "status": "success",
            "preferences": preferences.dict(),
            "recommendations": unique_wines[:4]  # 4개로 제한
        }
        
    except Exception as e:
        logger.error(f"Error in test recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))
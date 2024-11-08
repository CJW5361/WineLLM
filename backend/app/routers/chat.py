# backend/app/routers/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from ..vector_store import get_vector_store
import json
import logging

logger = logging.getLogger(__name__)

SYSTEM_TEMPLATE = """당신은 와인 전문가입니다. 사용자의 질문을 분석하여 와인을 추천해주세요.
추천할 때는 반드시 와인의 특성(당도, 산도, 바디, 타닌)을 설명하고, 구체적인 와인을 추천해주세요.
"""

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

router = APIRouter(prefix="/chat", tags=["chat"])

def process_wine_data(docs):
    wines = []
    for doc in docs:
        try:
            wine = {
                "name_ko": doc.metadata.get("name_ko", ""),
                "name_en": doc.metadata.get("name_en", ""),
                "wine_type": doc.metadata.get("wine_type", ""),
                "winery": doc.metadata.get("winery", ""),
                "country": doc.metadata.get("country", ""),
                "region": doc.metadata.get("region", ""),
                "price": doc.metadata.get("price"),
                "sweetness": int(doc.metadata.get("sweetness", 1)),
                "acidity": int(doc.metadata.get("acidity", 1)),
                "body": int(doc.metadata.get("body", 1)),
                "tannin": int(doc.metadata.get("tannin", 1)),
                "aroma": doc.metadata.get("aroma", ""),
                "food_matching": doc.metadata.get("food_matching", ""),
                "image_url": doc.metadata.get("image_url", ""),
                "detail_url": doc.metadata.get("detail_url", "")
            }
            wines.append(wine)
            logger.info(f"Processed wine: {wine['name_ko']}")
        except Exception as e:
            logger.error(f"Error processing wine: {e}")
    return wines

@router.post("/ask", response_model=ChatResponse)
async def chat_with_wine_expert(request: ChatRequest):
    try:
        vector_store = get_vector_store()
        logger.info(f"Searching for: {request.message}")
        
        # 더 많은 문서를 검색한 후 중복 제거
        docs = vector_store.similarity_search(request.message, k=10)
        
        # 중복 제거 (name_ko 기준)
        unique_docs = []
        seen_names = set()
        
        for doc in docs:
            name_ko = doc.metadata.get("name_ko", "")
            if name_ko not in seen_names:
                seen_names.add(name_ko)
                unique_docs.append(doc)
                if len(unique_docs) == 3:  # 원하는 개수만큼 유지
                    break
        
        logger.info(f"Found {len(unique_docs)} unique documents")
        
        # 와인 데이터 처리
        wines = process_wine_data(unique_docs)
        logger.info(f"Processed {len(wines)} unique wines")
        
        if not wines:
            return ChatResponse(response="죄송합니다. 적절한 와인을 찾지 못했습니다.")
            
        # 특성 분석
        avg_sweetness = sum(w["sweetness"] for w in wines) / len(wines)
        avg_acidity = sum(w["acidity"] for w in wines) / len(wines)
        avg_body = sum(w["body"] for w in wines) / len(wines)
        avg_tannin = sum(w["tannin"] for w in wines) / len(wines)
        
        characteristics = {
            "당도": f"{'높음' if avg_sweetness > 3 else '중간' if avg_sweetness > 2 else '낮음'} (평균 {avg_sweetness:.1f}/5)",
            "산도": f"{'높음' if avg_acidity > 3 else '중간' if avg_acidity > 2 else '낮음'} (평균 {avg_acidity:.1f}/5)",
            "바디": f"{'무거움' if avg_body > 3 else '중간' if avg_body > 2 else '가벼움'} (평균 {avg_body:.1f}/5)",
            "타닌": f"{'강함' if avg_tannin > 3 else '중간' if avg_tannin > 2 else '약함'} (평균 {avg_tannin:.1f}/5)"
        }
        
        response_data = {
            "text": f"검색하신 '{request.message}'에 맞는 와인을 추천해드립니다.",
            "characteristics": characteristics,
            "wines": wines
        }
        
        return ChatResponse(response=json.dumps(response_data, ensure_ascii=False))
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
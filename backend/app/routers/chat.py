# backend/app/routers/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
import json
import logging
from app.vector_store import get_vector_store
import traceback
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_TEMPLATE = """당신은 와인 전문가입니다. 다음과 같은 역할을 수행할 수 있습니다:

1. 와인 추천: 사용자가 와인 추천을 요청하면 구체적인 와인을 추천해주세요.
2. 와인 정보 제공: 와인에 대한 일반적인 질문에는 전문가적인 설명을 제공해주세요.
3. 와인 관련 상담: 보관 방법, 음식 페어링, 서빙 온도 등에 대해 답변해주세요.

추천을 요청받았을 때는 반드시 구체적인 와인을 추천하고, 
그 외의 질문에는 전문가적인 설명을 제공해주세요.
"""

class ChatRequest(BaseModel):
    message: str
    taste_profile: dict | None = None
    last_recommendations: list | None = None  # 마지막 추천 와인 목록 추가

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
        # 추천 관련 키워드 확인
        recommendation_keywords = ["추천", "찾아", "알려줘", "뭐가 좋을까", "어떤 와인"]
        is_recommendation = any(keyword in request.message for keyword in recommendation_keywords)
        
        if is_recommendation:
            vector_store = await get_vector_store()
            
            # 취향 프로필이 있는 경우, 검색 쿼리에 취향 정보 추가
            search_query = request.message
            if request.taste_profile:
                min_price, max_price = request.taste_profile.get('price_range', (0, 1000000))
                search_query += f"""
                당도: {request.taste_profile.get('preferred_sweetness', 3)}
                산도: {request.taste_profile.get('preferred_acidity', 3)}
                바디: {request.taste_profile.get('preferred_body', 3)}
                타닌: {request.taste_profile.get('preferred_tannin', 3)}
                선호 종류: {', '.join(request.taste_profile.get('preferred_types', []))}
                가격대: {min_price}원 ~ {max_price}원
                """
            
            docs = vector_store.similarity_search(search_query, k=10)
            
            # 중복 제거 및 취향 필터링
            unique_docs = []
            seen_names = set()
            
            for doc in docs:
                name_ko = doc.metadata.get("name_ko", "")
                
                # 취향 프로필 기반 필터링
                if request.taste_profile and request.taste_profile.get('preferred_types'):
                    wine_type = doc.metadata.get("wine_type", "")
                    if not any(pref_type in wine_type for pref_type in request.taste_profile['preferred_types']):
                        continue
                
                if name_ko and name_ko not in seen_names:
                    # 가격 범위 확인
                    if request.taste_profile and 'price_range' in request.taste_profile:
                        price = doc.metadata.get("price", 0)
                        if price is None:  # None 값 처리
                            continue
                        min_price, max_price = request.taste_profile['price_range']
                        # 가격이 범위를 벗어나면 건너뛰기 (20% 여유 추가)
                        if not (min_price * 0.8 <= price <= max_price * 1.2):
                            logger.info(f"Skipping wine {name_ko} due to price: {price} (range: {min_price}-{max_price})")
                            continue
                    
                    seen_names.add(name_ko)
                    unique_docs.append(doc)
                    if len(unique_docs) >= 2:  # 최대 2개 추천
                        break
            
            wines = process_wine_data(unique_docs)
            
            if not wines:
                return ChatResponse(response=json.dumps({
                    "type": "text",
                    "text": "죄송합니다. 조건에 맞는 와인을 찾지 못했습니다."
                }, ensure_ascii=False))
            
            # 특성 분석
            avg_sweetness = sum(w["sweetness"] for w in wines) / len(wines)
            avg_acidity = sum(w["acidity"] for w in wines) / len(wines)
            avg_body = sum(w["body"] for w in wines) / len(wines)
            avg_tannin = sum(w["tannin"] for w in wines) / len(wines)
            
            characteristics = {
                "당도": f"{'높음' if avg_sweetness > 3 else '중간' if avg_sweetness > 2 else '낮음'} (평균 {avg_sweetness:.1f}/5)",
                "산도": f"{'높음' if avg_acidity > 3 else '중간' if avg_acidity > 2 else '낮음'} (평균 {avg_acidity:.1f}/5)",
                "바디": f"{'무거움' if avg_body > 3 else '중간' if avg_body > 2 else '가벼움'} (평균 {avg_body:.1f}/5)",
                "타닌": f"{'강함' if avg_tannin > 3 else '중간' if avg_tannin > 2 else '약함'} (균 {avg_tannin:.1f}/5)"
            }
            
            # 취향 프로필 기반 응답 메시지 생성
            if request.taste_profile:
                response_text = f"고객님의 취향 프로필(당도: {request.taste_profile.get('preferred_sweetness')}/5, "
                response_text += f"산도: {request.taste_profile.get('preferred_acidity')}/5, "
                response_text += f"바디: {request.taste_profile.get('preferred_body')}/5, "
                response_text += f"타닌: {request.taste_profile.get('preferred_tannin')}/5)을 반영하여 "
                response_text += f"'{request.message}'에 맞는 와인을 추천해드립니다."
            else:
                response_text = f"'{request.message}'에 맞는 와인을 추천해드립니다."
            
            response_data = {
                "type": "recommendation",
                "text": response_text,
                "characteristics": characteristics,
                "wines": wines
            }
            
            logger.info(f"Search query: {search_query}")
            logger.info(f"Found {len(docs)} initial matches")
            logger.info(f"Filtered to {len(unique_docs)} unique recommendations")
            
            return ChatResponse(response=json.dumps(response_data, ensure_ascii=False))
                
        else:
            # 일반 대화 처리
            settings = get_settings()
            if not settings.openai_api_key:
                logger.error("OpenAI API key is missing")
                return ChatResponse(response=json.dumps({
                    "type": "text",
                    "text": "OpenAI API 키가 설정되지 않았습니다."
                }, ensure_ascii=False))

            logger.info("Initializing ChatOpenAI...")
            chat = ChatOpenAI(
                temperature=0.7,
                openai_api_key=settings.openai_api_key,
                model="gpt-3.5-turbo"
            )
            
            # 시스템 메시지에 이전 추천 와인 정보 포함
            system_message = SYSTEM_TEMPLATE
            if request.last_recommendations:
                wines_context = []
                for wine in request.last_recommendations:
                    wine_context = (
                        f"와인 이름: {wine['name_ko']}\n"
                        f"특징:\n"
                        f"- 당도: {wine['sweetness']}/5\n"
                        f"- 산도: {wine['acidity']}/5\n"
                        f"- 바디: {wine['body']}/5\n"
                        f"- 타닌: {wine['tannin']}/5\n"
                        f"음식 페어링: {wine['food_matching']}"
                    )
                    wines_context.append(wine_context)
                
                context = (
                    "\n\n직전에 추천한 와인 정보:\n"
                    f"{chr(10).join(wines_context)}\n\n"
                    "사용자의 질문이 이전에 추천한 와인에 대한 것이라면, "
                    "해당 와인의 특성을 고려하여 구체적으로 답변해주세요."
                )
                
                system_message += context
            
            messages = [
                SystemMessage(content=system_message),
                HumanMessage(content=request.message)
            ]
            
            try:
                response = chat(messages)
                logger.info(f"ChatGPT Response: {response.content}")
                
                response_data = {
                    "type": "text",
                    "text": response.content
                }
                
                return ChatResponse(response=json.dumps(response_data, ensure_ascii=False))
                
            except Exception as e:
                logger.error(f"ChatOpenAI error: {str(e)}")
                logger.error(f"Full traceback: {traceback.format_exc()}")
                error_response = {
                    "type": "error",
                    "text": f"죄송합니다. 오류가 발생했습니다: {str(e)}"
                }
                return ChatResponse(response=json.dumps(error_response, ensure_ascii=False))
                
    except Exception as e:
        logger.error(f"General error: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        error_response = {
            "type": "error",
            "text": "죄송합니다. 시스템 오류가 발생했습니다."
        }
        return ChatResponse(response=json.dumps(error_response, ensure_ascii=False))
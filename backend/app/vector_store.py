# backend/app/vector_store.py
import pandas as pd
from pathlib import Path
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
import logging
import os
from app.config import get_settings
import json
from chromadb.config import Settings

logger = logging.getLogger(__name__)
settings = get_settings()

def load_wine_data():
    try:
        # 절대 경로로 변경
        current_dir = Path(__file__).parent.parent
        csv_path = current_dir / "data" / "wine21_all_data.csv"
        
        # 파일 존재 여부 로깅
        logger.info(f"Looking for CSV file at: {csv_path}")
        logger.info(f"File exists: {csv_path.exists()}")
        
        if not csv_path.exists():
            # 상위 디렉토리에서도 찾아보기
            alternative_path = current_dir.parent / "data" / "wine21_all_data.csv"
            logger.info(f"Trying alternative path: {alternative_path}")
            
            if alternative_path.exists():
                csv_path = alternative_path
            else:
                raise FileNotFoundError(f"CSV file not found at: {csv_path} or {alternative_path}")
        
        df = pd.read_csv(csv_path)
        logger.info(f"Successfully loaded {len(df)} wine records from {csv_path}")
        return df
    except Exception as e:
        logger.error(f"Error loading wine data: {e}")
        raise

def create_wine_documents(df):
    documents = []
    for idx, row in df.iterrows():
        try:
            # 결측치 처리 - None 대신 기본값 사용
            sweetness = int(row['sweetness']) if pd.notna(row['sweetness']) else 1
            acidity = int(row['acidity']) if pd.notna(row['acidity']) else 1
            body = int(row['body']) if pd.notna(row['body']) else 1
            tannin = int(row['tannin']) if pd.notna(row['tannin']) else 1
            price = int(row['price']) if pd.notna(row['price']) else 0
            
            # 문자열 필드의 결측치 처리
            name_ko = str(row['name_ko']) if pd.notna(row['name_ko']) else ""
            name_en = str(row['name_en']) if pd.notna(row['name_en']) else ""
            wine_type = str(row['wine_type']) if pd.notna(row['wine_type']) else ""
            winery = str(row['winery']) if pd.notna(row['winery']) else ""
            country = str(row['country']) if pd.notna(row['country']) else ""
            region = str(row['region']) if pd.notna(row['region']) else ""
            aroma = str(row['aroma']) if pd.notna(row['aroma']) else ""
            food_matching = str(row['food_matching']) if pd.notna(row['food_matching']) else ""
            image_url = str(row['image_url']) if pd.notna(row['image_url']) else ""
            detail_url = str(row['detail_url']) if pd.notna(row['detail_url']) else ""
            
            content = f"""
            와인 이름: {name_ko}
            영문 이름: {name_en}
            와이너리: {winery}
            국가: {country}
            지역: {region}
            종류: {wine_type}
            당도: {sweetness}
            산도: {acidity}
            바디: {body}
            타닌: {tannin}
            아로마: {aroma}
            음식 페어링: {food_matching}
            """
            metadata = {
                "name_ko": name_ko,
                "name_en": name_en,
                "wine_type": wine_type,
                "winery": winery,
                "country": country,
                "region": region,
                "price": price,
                "sweetness": sweetness,
                "acidity": acidity,
                "body": body,
                "tannin": tannin,
                "aroma": aroma,
                "food_matching": food_matching,
                "image_url": image_url,
                "detail_url": detail_url
            }
            documents.append(Document(page_content=content, metadata=metadata))
        except Exception as e:
            logger.error(f"Error creating document for row {idx}: {e}")
            continue
    return documents

async def get_vector_store():
    try:
        current_dir = Path(__file__).parent.parent
        persist_directory = current_dir / "data" / "vector_store"
        
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        embeddings = OpenAIEmbeddings(openai_api_key=settings.openai_api_key)
        
        if persist_directory.exists():
            logger.info(f"Found existing vector store at {persist_directory}")
            vector_store = Chroma(
                persist_directory=str(persist_directory), 
                embedding_function=embeddings
            )
            return vector_store
        
        logger.info("Creating new vector store...")
        df = load_wine_data()
        documents = create_wine_documents(df)
        
        if not documents:
            raise ValueError("No documents created from wine data")
        
        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=embeddings,
            persist_directory=str(persist_directory)
        )
        
        logger.info(f"Created new vector store at {persist_directory}")
        return vector_store
        
    except Exception as e:
        logger.error(f"Error in get_vector_store: {e}")
        raise
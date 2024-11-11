from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, recommendations
from app.vector_store import get_vector_store
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="Wine LLM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up...")
    try:
        await get_vector_store()
        logger.info("Vector store initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing vector store: {e}")
        raise

app.include_router(chat.router)
app.include_router(recommendations.router)

@app.get("/")
async def root():
    return {"message": "Wine LLM API is running"} 
from pydantic import BaseModel
from typing import List, Optional

class TasteProfile(BaseModel):
    preferred_sweetness: Optional[int] = None  # 1-5
    preferred_acidity: Optional[int] = None    # 1-5
    preferred_body: Optional[int] = None       # 1-5
    preferred_tannin: Optional[int] = None     # 1-5
    preferred_types: List[str] = []            # ["레드", "화이트", "스파클링"]
    price_range: tuple[int, int] = (0, 1000000)
    preferred_foods: List[str] = []
    disliked_characteristics: List[str] = []

class UserPreferences(BaseModel):
    user_id: str
    taste_profile: TasteProfile
    tasting_history: List[str] = []  # 와인 ID 리스트 
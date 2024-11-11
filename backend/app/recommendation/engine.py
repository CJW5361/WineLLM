from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from app.models.user_preferences import TasteProfile

class WineRecommender:
    def __init__(self, wine_data):
        self.wine_data = wine_data
        
    def create_wine_vector(self, wine):
        return np.array([
            wine.sweetness,
            wine.acidity,
            wine.body,
            wine.tannin,
            wine.price / 1000000  # 정규화
        ])
    
    def get_recommendations(self, taste_profile: TasteProfile, n_recommendations=2):
        # 특성별 가중치 설정
        weights = {
            'sweetness': 1.0,
            'acidity': 1.0,
            'body': 1.0,
            'tannin': 1.0,
            'price': 0.5  # 가격은 상대적으로 낮은 가중치
        }
        
        # 사용자 벡터 생성
        user_vector = np.array([
            taste_profile.preferred_sweetness or 3,
            taste_profile.preferred_acidity or 3,
            taste_profile.preferred_body or 3,
            taste_profile.preferred_tannin or 3,
            (sum(taste_profile.price_range) / 2) / max(w.price for w in self.wine_data)  # 상대적 가격 정규화
        ])
        
        similarities = []
        for wine in self.wine_data:
            # 기본 필터링
            if wine.wine_type not in taste_profile.preferred_types:
                continue
            if wine.price < taste_profile.price_range[0] or wine.price > taste_profile.price_range[1]:
                continue
                
            # 기피 특성 확인
            if any(char in wine.characteristics for char in taste_profile.disliked_characteristics):
                continue
                
            # 음식 페어링 보너스
            food_bonus = 0.1 if any(food in wine.food_matching for food in taste_profile.preferred_foods) else 0
            
            # 와인 벡터 생성
            wine_vector = self.create_wine_vector(wine)
            
            # 가중치가 적용된 유사도 계산
            weighted_similarity = sum(
                w * cosine_similarity(
                    user_vector[i].reshape(1, -1), 
                    wine_vector[i].reshape(1, -1)
                )[0][0] 
                for i, w in enumerate(weights.values())
            ) / sum(weights.values())
            
            # 음식 페어링 보너스 적용
            final_score = weighted_similarity * (1 + food_bonus)
            
            similarities.append((wine, final_score))
        
        # 점수 기준으로 정렬
        recommendations = sorted(similarities, key=lambda x: x[1], reverse=True)
        
        return recommendations[:n_recommendations] 
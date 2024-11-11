

# 와인 추천 챗봇 프로젝트 🍷

## 소개
이 프로젝트는 사용자의 취향과 상황에 맞는 와인을 추천해주는 AI 기반 챗봇 서비스입니다. Vector Store와 LangChain을 활용한 RAG(Retrieval Augmented Generation) 시스템을 구현하여 정확하고 맥락에 맞는 와인 추천 및 정보를 제공합니다.



# 데이터 출처 = 와인21 
크롤링으로 데이터 수집
## 주요 기능 ✨

### 1. 맞춤형 와인 추천
- 사용자의 취향 프로필 기반 추천
- 가격대, 와인 종류, 맛 특성 반영
- 실시간 와인 데이터베이스 검색


```71:82:backend/app/routers/chat.py
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
```


### 2. 대화형 인터페이스
- 자연스러운 대화를 통한 와인 추천
- 이전 추천 내역 기반의 맥락 유지
- 와인 관련 일반 질문 응답

### 3. 와인 특성 분석
- 당도, 산도, 바디감, 타닌 등 상세 분석
- 음식 페어링 추천
- 가격대별 필터링

## 기술 스택 🛠

### Backend
- FastAPI
- LangChain
- OpenAI GPT-3.5
- Vector Store (FAISS)
- Python 3.9+

### Frontend
- React
- JavaScript
## 시스템 아키텍처 📐

### RAG (Retrieval Augmented Generation) 시스템

```43:79:backend/app/vector_store.py
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
```


### 추천 엔진

```18:67:backend/app/recommendation/engine.py
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
```

실행
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm start
```




## 연락처 📧
프로젝트 관리자 - [cj5361@naver.com](mailto:cj5361@naver.com)

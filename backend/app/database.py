# backend/app/database.py
import pandas as pd
from pathlib import Path
from typing import List
from .models import Wine

class WineDatabase:
    def __init__(self):
        self.wines: List[Wine] = []
        self._load_data()

    def _load_data(self):
        data_path = Path(__file__).parent.parent / "data" / "wine21_all_data.csv"
        df = pd.read_csv(data_path)
        
        for _, row in df.iterrows():
            wine = Wine(
                name_ko=row['name_ko'],
                name_en=row['name_en'],
                winery=row['winery'],
                country=row['country'],
                region=row['region'],
                wine_type=row['wine_type'],
                price=row['price'] if pd.notna(row['price']) else None,
                sweetness=row['sweetness'],
                acidity=row['acidity'],
                body=row['body'],
                tannin=row['tannin'],
                aroma=row['aroma'],
                food_matching=row['food_matching']
            )
            self.wines.append(wine)

    def get_all_wines(self) -> List[Wine]:
        return self.wines

    def search_wines(self, query: str) -> List[Wine]:
        query = query.lower()
        return [
            wine for wine in self.wines
            if query in wine.name_ko.lower() or 
               query in wine.name_en.lower() or
               query in wine.winery.lower()
        ]

wine_db = WineDatabase()
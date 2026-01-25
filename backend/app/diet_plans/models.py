from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class Nutrition(BaseModel):
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fat: float = Field(ge=0)


class DietPlanCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: str = Field(min_length=2, max_length=2000)
    durationDays: int = Field(ge=1, le=14)  # KEY REQUIREMENT
    category: str = Field(min_length=1, max_length=40)
    imageUrl: Optional[str] = None
    dishIds: List[str] = Field(min_length=1)
    nutritionTotal: Nutrition


class DietPlanResponse(DietPlanCreate):
    id: str

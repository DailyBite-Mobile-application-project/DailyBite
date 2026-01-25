from __future__ import annotations

from typing import List
from pydantic import BaseModel, Field


class DishIngredient(BaseModel):
    productId: str = Field(min_length=1)
    grams: float = Field(gt=0)


class Nutrition(BaseModel):
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fat: float = Field(ge=0)


class DishCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    prepTimeMinutes: int = Field(gt=0, le=600)
    instructions: str = Field(min_length=2, max_length=5000)
    ingredients: List[DishIngredient] = Field(min_length=1)
    nutritionTotal: Nutrition


class DishResponse(DishCreate):
    id: str

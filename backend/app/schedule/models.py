from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal, Optional

MealType = Literal["breakfast", "lunch", "dinner", "snack"]


class ScheduledMealCreate(BaseModel):
  date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")   # YYYY-MM-DD
  time: str = Field(pattern=r"^\d{2}:\d{2}$")         # HH:MM
  dishId: str = Field(min_length=1)
  type: MealType


class ScheduledMealResponse(ScheduledMealCreate):
  id: str

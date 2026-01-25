from pydantic import BaseModel, Field
from typing import Literal, Optional

MealType = Literal["breakfast", "lunch", "dinner", "snack"]


class ScheduledMealCreate(BaseModel):
    date: str = Field(..., description="YYYY-MM-DD")
    time: str = Field(..., description="HH:MM")
    dishId: str
    type: MealType


class ScheduledMealUpdate(BaseModel):
    date: Optional[str] = Field(None, description="YYYY-MM-DD")
    time: Optional[str] = Field(None, description="HH:MM")
    dishId: Optional[str] = None
    type: Optional[MealType] = None


class ScheduledMealOut(BaseModel):
    id: str
    userId: str
    date: str
    time: str
    dishId: str
    type: MealType

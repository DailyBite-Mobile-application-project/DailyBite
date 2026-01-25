from pydantic import BaseModel


class UserMe(BaseModel):
  id: str
  email: str
  name: str | None = None


class UserStats(BaseModel):
  daysActive: int
  mealsLogged: int

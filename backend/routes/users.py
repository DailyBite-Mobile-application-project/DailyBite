from fastapi import APIRouter, Depends
from backend.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me")
async def read_me(current_user=Depends(get_current_user)):
    return {"id": current_user.get("id"), "email": current_user.get("email")}

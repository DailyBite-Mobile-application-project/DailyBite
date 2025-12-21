from fastapi import APIRouter, Depends, status
from backend.auth import get_current_user
from backend.schemas import UserResponse

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
async def read_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
    }

from fastapi import FastAPI, HTTPException
from models import UserCreate, UserLogin, UserPublic
from database import users_collection
from auth import hash_password, verify_password, create_token
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


# uvicorn main:app --reload --host 0.0.0.0
@app.post("/signup")
async def signup(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(400, "Email already in use")

    passwordHash = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "passwordHash": passwordHash,
        "goal": "Weight loss",
        "targetCalories": 2000
    }

    result = await users_collection.insert_one(new_user)
    user_id = str(result.inserted_id)

    token = create_token(user_id)

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user.name,
            "email": user.email
        }
    }


@app.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(400, "Invalid credentials")

    if not verify_password(user.password, db_user["passwordHash"]):
        raise HTTPException(400, "Invalid credentials")

    token = create_token(str(db_user["_id"]))

    return {
        "token": token,
        "user": {
            "id": str(db_user["_id"]),
            "name": db_user["name"],
            "email": db_user["email"]
        }
    }

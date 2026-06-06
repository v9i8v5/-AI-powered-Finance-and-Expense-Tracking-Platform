from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson.objectid import ObjectId
from app.models import UserCreate, UserLogin
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
)
from app.db import get_database

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(user: UserCreate):
    """Register a new user"""
    db = get_database()
    users_collection = db["users"]

    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = hash_password(user.password)
    new_user = {
        "email": user.email,
        "password_hash": hashed_password,
        "name": user.name,
        "created_at": datetime.utcnow(),
        "theme": "light"
    }

    result = await users_collection.insert_one(new_user)
    created_user = await users_collection.find_one({"_id": result.inserted_id})

    # Create token
    access_token = create_access_token(data={"sub": str(created_user["_id"])})

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "user": {
                "id": str(created_user["_id"]),
                "email": created_user["email"],
                "name": created_user["name"],
                "created_at": created_user["created_at"].isoformat(),
                "theme": created_user["theme"]
            }
        }
    }


@router.post("/login")
async def login(credentials: UserLogin):
    """Login user and return JWT token"""
    db = get_database()
    users_collection = db["users"]

    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create token
    access_token = create_access_token(data={"sub": str(user["_id"])})

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user["name"],
                "created_at": user["created_at"].isoformat(),
                "theme": user["theme"]
            }
        }
    }


@router.get("/me")
async def get_current_user(user_id: str = Depends(verify_token)):
    """Get current user profile"""
    db = get_database()
    users_collection = db["users"]

    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return {
        "success": True,
        "data": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"].isoformat(),
            "theme": user["theme"]
        }
    }

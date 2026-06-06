from bson.objectid import ObjectId
from datetime import datetime
from app.db import get_database


async def get_user_income(user_id: str, limit: int = 100, skip: int = 0):
    """Get all income for a user"""
    db = get_database()
    income_collection = db["income"]
    
    income_list = await income_collection.find(
        {"user_id": ObjectId(user_id)}
    ).sort("date", -1).skip(skip).limit(limit).to_list(length=None)
    
    return [
        {
            "id": str(inc["_id"]),
            "user_id": str(inc["user_id"]),
            "amount": inc["amount"],
            "source": inc["source"],
            "description": inc["description"],
            "date": inc["date"].isoformat(),
            "created_at": inc["created_at"].isoformat(),
        }
        for inc in income_list
    ]


async def create_income(user_id: str, amount: float, source: str, description: str, date: datetime):
    """Create new income record"""
    db = get_database()
    income_collection = db["income"]
    
    income = {
        "user_id": ObjectId(user_id),
        "amount": amount,
        "source": source,
        "description": description,
        "date": date,
        "created_at": datetime.utcnow(),
    }
    
    result = await income_collection.insert_one(income)
    created = await income_collection.find_one({"_id": result.inserted_id})
    
    return {
        "id": str(created["_id"]),
        "user_id": str(created["user_id"]),
        "amount": created["amount"],
        "source": created["source"],
        "description": created["description"],
        "date": created["date"].isoformat(),
        "created_at": created["created_at"].isoformat(),
    }


async def update_income(income_id: str, user_id: str, **kwargs):
    """Update income record"""
    db = get_database()
    income_collection = db["income"]
    
    income = await income_collection.find_one({
        "_id": ObjectId(income_id),
        "user_id": ObjectId(user_id)
    })
    
    if not income:
        return None
    
    update_data = {k: v for k, v in kwargs.items() if v is not None}
    
    if update_data:
        await income_collection.update_one(
            {"_id": ObjectId(income_id)},
            {"$set": update_data}
        )
    
    updated = await income_collection.find_one({"_id": ObjectId(income_id)})
    
    return {
        "id": str(updated["_id"]),
        "user_id": str(updated["user_id"]),
        "amount": updated["amount"],
        "source": updated["source"],
        "description": updated["description"],
        "date": updated["date"].isoformat(),
        "created_at": updated["created_at"].isoformat(),
    }


async def delete_income(income_id: str, user_id: str):
    """Delete income record"""
    db = get_database()
    income_collection = db["income"]
    
    result = await income_collection.delete_one({
        "_id": ObjectId(income_id),
        "user_id": ObjectId(user_id)
    })
    
    return result.deleted_count > 0

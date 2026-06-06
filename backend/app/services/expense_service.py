from bson.objectid import ObjectId
from datetime import datetime
from app.db import get_database

EXPENSE_CATEGORIES = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Education",
    "Other"
]


async def get_user_expenses(user_id: str, limit: int = 100, skip: int = 0):
    """Get all expenses for a user"""
    db = get_database()
    expenses_collection = db["expenses"]
    
    expenses = await expenses_collection.find(
        {"user_id": ObjectId(user_id)}
    ).sort("date", -1).skip(skip).limit(limit).to_list(length=None)
    
    return [
        {
            "id": str(exp["_id"]),
            "user_id": str(exp["user_id"]),
            "amount": exp["amount"],
            "category": exp["category"],
            "description": exp["description"],
            "date": exp["date"].isoformat(),
            "created_at": exp["created_at"].isoformat(),
        }
        for exp in expenses
    ]


async def create_expense(user_id: str, amount: float, category: str, description: str, date: datetime):
    """Create a new expense"""
    db = get_database()
    expenses_collection = db["expenses"]
    
    expense = {
        "user_id": ObjectId(user_id),
        "amount": amount,
        "category": category,
        "description": description,
        "date": date,
        "created_at": datetime.utcnow(),
    }
    
    result = await expenses_collection.insert_one(expense)
    created = await expenses_collection.find_one({"_id": result.inserted_id})
    
    return {
        "id": str(created["_id"]),
        "user_id": str(created["user_id"]),
        "amount": created["amount"],
        "category": created["category"],
        "description": created["description"],
        "date": created["date"].isoformat(),
        "created_at": created["created_at"].isoformat(),
    }


async def update_expense(expense_id: str, user_id: str, **kwargs):
    """Update an expense"""
    db = get_database()
    expenses_collection = db["expenses"]
    
    # Verify ownership
    expense = await expenses_collection.find_one({
        "_id": ObjectId(expense_id),
        "user_id": ObjectId(user_id)
    })
    
    if not expense:
        return None
    
    update_data = {k: v for k, v in kwargs.items() if v is not None}
    
    if update_data:
        await expenses_collection.update_one(
            {"_id": ObjectId(expense_id)},
            {"$set": update_data}
        )
    
    updated = await expenses_collection.find_one({"_id": ObjectId(expense_id)})
    
    return {
        "id": str(updated["_id"]),
        "user_id": str(updated["user_id"]),
        "amount": updated["amount"],
        "category": updated["category"],
        "description": updated["description"],
        "date": updated["date"].isoformat(),
        "created_at": updated["created_at"].isoformat(),
    }


async def delete_expense(expense_id: str, user_id: str):
    """Delete an expense"""
    db = get_database()
    expenses_collection = db["expenses"]
    
    result = await expenses_collection.delete_one({
        "_id": ObjectId(expense_id),
        "user_id": ObjectId(user_id)
    })
    
    return result.deleted_count > 0

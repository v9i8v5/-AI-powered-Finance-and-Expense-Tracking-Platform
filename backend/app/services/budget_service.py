from bson.objectid import ObjectId
from datetime import datetime
from app.db import get_database


async def get_user_budgets(user_id: str) -> list:
    """Get all budgets with current spend for the user."""
    db = get_database()
    budgets_col = db["budgets"]
    expenses_col = db["expenses"]

    uid = ObjectId(user_id)
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    budgets = await budgets_col.find({"user_id": uid}).to_list(length=None)

    result = []
    for b in budgets:
        # Calculate how much was spent in this category this month
        spent_docs = await expenses_col.find({
            "user_id": uid,
            "category": b["category"],
            "date": {"$gte": month_start},
        }).to_list(length=None)

        spent = round(sum(e["amount"] for e in spent_docs), 2)
        limit = b["limit"]
        percentage = round((spent / limit * 100) if limit else 0, 1)

        result.append({
            "id": str(b["_id"]),
            "user_id": str(b["user_id"]),
            "category": b["category"],
            "limit": limit,
            "spent": spent,
            "remaining": round(limit - spent, 2),
            "percentage": percentage,
            "status": "over" if spent > limit else "warning" if percentage >= 80 else "ok",
            "created_at": b["created_at"].isoformat(),
        })

    return result


async def create_budget(user_id: str, category: str, limit: float) -> dict:
    """Create or replace a budget for a category."""
    db = get_database()
    budgets_col = db["budgets"]
    uid = ObjectId(user_id)

    # Upsert — one budget per category per user
    await budgets_col.update_one(
        {"user_id": uid, "category": category},
        {"$set": {"limit": limit, "created_at": datetime.utcnow()}},
        upsert=True,
    )

    doc = await budgets_col.find_one({"user_id": uid, "category": category})
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "category": doc["category"],
        "limit": doc["limit"],
        "created_at": doc["created_at"].isoformat(),
    }


async def update_budget(budget_id: str, user_id: str, limit: float) -> dict | None:
    """Update an existing budget's limit."""
    db = get_database()
    budgets_col = db["budgets"]

    result = await budgets_col.update_one(
        {"_id": ObjectId(budget_id), "user_id": ObjectId(user_id)},
        {"$set": {"limit": limit}},
    )

    if result.matched_count == 0:
        return None

    doc = await budgets_col.find_one({"_id": ObjectId(budget_id)})
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "category": doc["category"],
        "limit": doc["limit"],
        "created_at": doc["created_at"].isoformat(),
    }


async def delete_budget(budget_id: str, user_id: str) -> bool:
    """Delete a budget."""
    db = get_database()
    budgets_col = db["budgets"]

    result = await budgets_col.delete_one({
        "_id": ObjectId(budget_id),
        "user_id": ObjectId(user_id),
    })
    return result.deleted_count > 0

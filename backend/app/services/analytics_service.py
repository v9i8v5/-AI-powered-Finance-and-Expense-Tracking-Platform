from bson.objectid import ObjectId
from datetime import datetime, timedelta
from calendar import month_name
from app.db import get_database


async def get_financial_summary(user_id: str) -> dict:
    """Return full financial summary for the current month and all-time."""
    db = get_database()
    expenses_col = db["expenses"]
    income_col = db["income"]

    uid = ObjectId(user_id)
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    # ---------- all-time totals ----------
    all_expenses = await expenses_col.find({"user_id": uid}).to_list(length=None)
    all_income = await income_col.find({"user_id": uid}).to_list(length=None)

    total_expenses = sum(e["amount"] for e in all_expenses)
    total_income = sum(i["amount"] for i in all_income)

    # ---------- current month ----------
    month_expenses = [e for e in all_expenses if e["date"] >= month_start]
    month_income = [i for i in all_income if i["date"] >= month_start]

    month_expense_total = sum(e["amount"] for e in month_expenses)
    month_income_total = sum(i["amount"] for i in month_income)

    # ---------- previous month ----------
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)
    prev_month_expenses = [
        e for e in all_expenses
        if prev_month_start <= e["date"] < month_start
    ]
    prev_month_total = sum(e["amount"] for e in prev_month_expenses)

    # ---------- category breakdown (current month) ----------
    category_totals: dict[str, float] = {}
    for e in month_expenses:
        category_totals[e["category"]] = category_totals.get(e["category"], 0) + e["amount"]

    categories = [
        {"category": k, "amount": round(v, 2), "percentage": round((v / month_expense_total * 100) if month_expense_total else 0, 1)}
        for k, v in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]

    # ---------- top category ----------
    top_category = categories[0]["category"] if categories else None

    # ---------- savings rate ----------
    savings = month_income_total - month_expense_total
    savings_rate = round((savings / month_income_total * 100) if month_income_total else 0, 1)

    # ---------- month-over-month change ----------
    mom_change = round(
        ((month_expense_total - prev_month_total) / prev_month_total * 100) if prev_month_total else 0, 1
    )

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_balance": round(total_income - total_expenses, 2),
        "month": {
            "income": round(month_income_total, 2),
            "expenses": round(month_expense_total, 2),
            "savings": round(savings, 2),
            "savings_rate": savings_rate,
            "mom_change": mom_change,
        },
        "top_category": top_category,
        "categories": categories,
    }


async def get_monthly_trends(user_id: str, months: int = 6) -> list:
    """Return income vs expense totals for the last N months."""
    db = get_database()
    expenses_col = db["expenses"]
    income_col = db["income"]

    uid = ObjectId(user_id)
    now = datetime.utcnow()

    result = []
    for i in range(months - 1, -1, -1):
        # calculate month boundaries
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1

        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        exp_docs = await expenses_col.find({
            "user_id": uid,
            "date": {"$gte": start, "$lt": end}
        }).to_list(length=None)

        inc_docs = await income_col.find({
            "user_id": uid,
            "date": {"$gte": start, "$lt": end}
        }).to_list(length=None)

        result.append({
            "month": f"{month_name[month][:3]} {year}",
            "income": round(sum(d["amount"] for d in inc_docs), 2),
            "expenses": round(sum(d["amount"] for d in exp_docs), 2),
        })

    return result


async def get_category_breakdown(user_id: str, period: str = "month") -> list:
    """Return spending by category for a given period."""
    db = get_database()
    expenses_col = db["expenses"]
    uid = ObjectId(user_id)
    now = datetime.utcnow()

    if period == "month":
        start = datetime(now.year, now.month, 1)
    elif period == "year":
        start = datetime(now.year, 1, 1)
    else:
        start = datetime(2000, 1, 1)  # all-time

    expenses = await expenses_col.find({
        "user_id": uid,
        "date": {"$gte": start}
    }).to_list(length=None)

    totals: dict[str, float] = {}
    for e in expenses:
        totals[e["category"]] = totals.get(e["category"], 0) + e["amount"]

    grand_total = sum(totals.values())
    return [
        {
            "category": k,
            "amount": round(v, 2),
            "percentage": round((v / grand_total * 100) if grand_total else 0, 1),
        }
        for k, v in sorted(totals.items(), key=lambda x: x[1], reverse=True)
    ]

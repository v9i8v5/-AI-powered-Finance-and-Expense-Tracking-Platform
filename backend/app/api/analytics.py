from fastapi import APIRouter, Depends
from app.auth import verify_token
from app.services.analytics_service import (
    get_financial_summary,
    get_monthly_trends,
    get_category_breakdown,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def analytics_summary(user_id: str = Depends(verify_token)):
    """Full financial summary for the current user."""
    data = await get_financial_summary(user_id)
    return {"success": True, "data": data}


@router.get("/trends")
async def monthly_trends(
    months: int = 6,
    user_id: str = Depends(verify_token),
):
    """Income vs expense totals for the last N months."""
    data = await get_monthly_trends(user_id, months=months)
    return {"success": True, "data": data}


@router.get("/categories")
async def category_breakdown(
    period: str = "month",
    user_id: str = Depends(verify_token),
):
    """Spending breakdown by category. period: month | year | all"""
    data = await get_category_breakdown(user_id, period=period)
    return {"success": True, "data": data}

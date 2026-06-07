from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import verify_token
from app.models import BudgetCreate, BudgetUpdate
from app.services.budget_service import (
    get_user_budgets,
    create_budget,
    update_budget,
    delete_budget,
)

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.get("")
async def list_budgets(user_id: str = Depends(verify_token)):
    """Get all budgets with current month spend."""
    budgets = await get_user_budgets(user_id)
    return {"success": True, "data": budgets}


@router.post("")
async def create_new_budget(
    budget: BudgetCreate,
    user_id: str = Depends(verify_token),
):
    """Create or update a budget for a category."""
    created = await create_budget(user_id, budget.category, budget.limit)
    return {"success": True, "data": created}


@router.put("/{budget_id}")
async def update_budget_record(
    budget_id: str,
    budget: BudgetUpdate,
    user_id: str = Depends(verify_token),
):
    """Update an existing budget's limit."""
    updated = await update_budget(budget_id, user_id, budget.limit)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return {"success": True, "data": updated}


@router.delete("/{budget_id}")
async def delete_budget_record(
    budget_id: str,
    user_id: str = Depends(verify_token),
):
    """Delete a budget."""
    deleted = await delete_budget(budget_id, user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return {"success": True, "data": {"deleted": True}}

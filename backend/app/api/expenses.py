from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from app.models import ExpenseCreate, ExpenseUpdate
from app.auth import verify_token
from app.services.expense_service import (
    get_user_expenses,
    create_expense,
    update_expense,
    delete_expense,
    EXPENSE_CATEGORIES,
)

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("/categories")
async def get_categories():
    """Get available expense categories"""
    return {"success": True, "data": EXPENSE_CATEGORIES}


@router.get("")
async def list_expenses(user_id: str = Depends(verify_token), limit: int = 100, skip: int = 0):
    """Get all expenses for authenticated user"""
    expenses = await get_user_expenses(user_id, limit, skip)
    return {"success": True, "data": expenses}


@router.post("")
async def create_new_expense(
    expense: ExpenseCreate,
    user_id: str = Depends(verify_token)
):
    """Create new expense"""
    created = await create_expense(
        user_id,
        expense.amount,
        expense.category,
        expense.description,
        expense.date
    )
    return {"success": True, "data": created}


@router.put("/{expense_id}")
async def update_expense_record(
    expense_id: str,
    expense: ExpenseUpdate,
    user_id: str = Depends(verify_token)
):
    """Update expense"""
    update_data = {}
    if expense.amount is not None:
        update_data["amount"] = expense.amount
    if expense.category is not None:
        update_data["category"] = expense.category
    if expense.description is not None:
        update_data["description"] = expense.description
    if expense.date is not None:
        update_data["date"] = expense.date
    
    updated = await update_expense(expense_id, user_id, **update_data)
    
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    
    return {"success": True, "data": updated}


@router.delete("/{expense_id}")
async def delete_expense_record(
    expense_id: str,
    user_id: str = Depends(verify_token)
):
    """Delete expense"""
    deleted = await delete_expense(expense_id, user_id)
    
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    
    return {"success": True, "data": {"deleted": True}}

from fastapi import APIRouter, Depends, HTTPException, status
from app.models import IncomeCreate, IncomeUpdate
from app.auth import verify_token
from app.services.income_service import (
    get_user_income,
    create_income,
    update_income,
    delete_income,
)

router = APIRouter(prefix="/api/income", tags=["income"])


@router.get("")
async def list_income(user_id: str = Depends(verify_token), limit: int = 100, skip: int = 0):
    """Get all income for authenticated user"""
    income_list = await get_user_income(user_id, limit, skip)
    return {"success": True, "data": income_list}


@router.post("")
async def create_new_income(
    income: IncomeCreate,
    user_id: str = Depends(verify_token)
):
    """Create new income record"""
    created = await create_income(
        user_id,
        income.amount,
        income.source,
        income.description,
        income.date
    )
    return {"success": True, "data": created}


@router.put("/{income_id}")
async def update_income_record(
    income_id: str,
    income: IncomeUpdate,
    user_id: str = Depends(verify_token)
):
    """Update income record"""
    update_data = {}
    if income.amount is not None:
        update_data["amount"] = income.amount
    if income.source is not None:
        update_data["source"] = income.source
    if income.description is not None:
        update_data["description"] = income.description
    if income.date is not None:
        update_data["date"] = income.date
    
    updated = await update_income(income_id, user_id, **update_data)
    
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")
    
    return {"success": True, "data": updated}


@router.delete("/{income_id}")
async def delete_income_record(
    income_id: str,
    user_id: str = Depends(verify_token)
):
    """Delete income record"""
    deleted = await delete_income(income_id, user_id)
    
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")
    
    return {"success": True, "data": {"deleted": True}}

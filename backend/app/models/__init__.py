from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str
    date: datetime


class IncomeCreate(BaseModel):
    amount: float
    source: str
    description: str
    date: datetime


class BudgetCreate(BaseModel):
    category: str
    limit: float


class ChatMessageCreate(BaseModel):
    content: str

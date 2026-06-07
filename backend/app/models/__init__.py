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


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class IncomeCreate(BaseModel):
    amount: float
    source: str
    description: str
    date: datetime


class IncomeUpdate(BaseModel):
    amount: Optional[float] = None
    source: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class BudgetCreate(BaseModel):
    category: str
    limit: float


class BudgetUpdate(BaseModel):
    limit: float


class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatMessageCreate(BaseModel):
    content: str
    history: Optional[list[ChatMessage]] = []

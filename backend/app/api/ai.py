from fastapi import APIRouter, Depends
from app.auth import verify_token
from app.models import ChatMessageCreate
from app.services.ai_service import generate_financial_summary, chat_with_ai

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/summary")
async def ai_summary(user_id: str = Depends(verify_token)):
    """Generate an AI-powered narrative summary of the user's finances."""
    summary = await generate_financial_summary(user_id)
    return {"success": True, "data": {"summary": summary}}


@router.post("/chat")
async def chat(
    message: ChatMessageCreate,
    user_id: str = Depends(verify_token),
):
    """Send a message to the AI financial advisor and receive a response."""
    response = await chat_with_ai(user_id, message.content, message.history or [])
    return {"success": True, "data": {"response": response}}

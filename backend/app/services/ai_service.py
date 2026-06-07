"""
AI Service — OpenAI-powered financial assistant.
Falls back to a rule-based engine when OPENAI_API_KEY is not set.
"""
import json
from datetime import datetime
from app.config import settings
from app.services.analytics_service import get_financial_summary, get_monthly_trends, get_category_breakdown


# ---------------------------------------------------------------------------
# Financial context builder
# ---------------------------------------------------------------------------

async def build_financial_context(user_id: str) -> str:
    """Assemble a compact financial snapshot for the AI prompt."""
    summary = await get_financial_summary(user_id)
    trends = await get_monthly_trends(user_id, months=3)

    lines = [
        f"Current month income: ${summary['month']['income']}",
        f"Current month expenses: ${summary['month']['expenses']}",
        f"Current month savings: ${summary['month']['savings']} ({summary['month']['savings_rate']}% savings rate)",
        f"Month-over-month expense change: {summary['month']['mom_change']}%",
        f"All-time net balance: ${summary['net_balance']}",
        f"Top spending category this month: {summary['top_category'] or 'N/A'}",
        "",
        "Category breakdown this month:",
    ]
    for cat in summary["categories"]:
        lines.append(f"  - {cat['category']}: ${cat['amount']} ({cat['percentage']}%)")

    lines.append("")
    lines.append("Monthly trends (last 3 months):")
    for t in trends:
        lines.append(f"  - {t['month']}: Income ${t['income']}, Expenses ${t['expenses']}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# AI summary generator
# ---------------------------------------------------------------------------

async def generate_financial_summary(user_id: str) -> str:
    """Generate an AI-written narrative summary of the user's finances."""
    context = await build_financial_context(user_id)

    system_prompt = (
        "You are a professional financial advisor. "
        "Analyze the user's financial data and produce a concise, friendly summary "
        "(3–5 sentences). Highlight spending trends, key categories, and one actionable tip. "
        "Do not invent numbers beyond what is provided."
    )

    user_prompt = f"Here is my financial data:\n{context}\n\nPlease summarize my financial health."

    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=300,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            # Fall through to rule-based fallback
            pass

    # ---------- Rule-based fallback ----------
    return _rule_based_summary(context)


def _rule_based_summary(context: str) -> str:
    """Simple rule-based summary when OpenAI is unavailable."""
    lines = context.strip().split("\n")
    data: dict = {}
    for line in lines:
        if "Current month income:" in line:
            data["income"] = line.split("$")[-1]
        elif "Current month expenses:" in line:
            data["expenses"] = line.split("$")[-1]
        elif "savings rate" in line:
            data["savings_rate"] = line
        elif "Top spending category" in line:
            data["top_cat"] = line.split(": ")[-1] if ": " in line else "N/A"
        elif "Month-over-month" in line:
            data["mom"] = line.split(": ")[-1]

    income = data.get("income", "0")
    expenses = data.get("expenses", "0")
    top_cat = data.get("top_cat", "N/A")
    mom = data.get("mom", "0%")

    return (
        f"This month you earned ${income} and spent ${expenses}. "
        f"Your highest spending category was {top_cat}. "
        f"Your expenses changed by {mom} compared to last month. "
        "Consider reviewing your discretionary spending to improve your savings rate."
    )


# ---------------------------------------------------------------------------
# AI chatbot
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are FinBot, a helpful AI financial advisor integrated into a personal finance app.
You have access to the user's real financial data provided below.
Answer questions about their spending, income, budgets, and savings concisely and helpfully.
Only reference the data provided — do not make up numbers.
Keep responses short (2-4 sentences) unless a detailed breakdown is requested.

Financial Data:
{context}
"""


async def chat_with_ai(user_id: str, message: str, history: list[dict]) -> str:
    """Process a chat message and return the AI response."""
    context = await build_financial_context(user_id)

    system = SYSTEM_PROMPT.format(context=context)

    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

            messages = [{"role": "system", "content": system}]
            # Include recent history (last 10 turns)
            for h in history[-10:]:
                messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=400,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return _rule_based_chat(message, context)

    return _rule_based_chat(message, context)


def _rule_based_chat(message: str, context: str) -> str:
    """Keyword-based fallback chatbot."""
    msg = message.lower()

    # Parse context into a dict for quick access
    data: dict = {}
    for line in context.split("\n"):
        if "Current month income:" in line:
            data["income"] = line.split("$")[-1].strip()
        elif "Current month expenses:" in line:
            data["expenses"] = line.split("$")[-1].strip()
        elif "savings rate" in line:
            try:
                data["savings_rate"] = line.split("(")[-1].split("%")[0].strip()
            except Exception:
                pass
        elif "Top spending category" in line:
            data["top_cat"] = line.split(": ")[-1].strip() if ": " in line else "N/A"
        elif "net balance" in line:
            data["balance"] = line.split("$")[-1].strip()

    if any(w in msg for w in ["spend", "spent", "expense"]):
        return (
            f"This month you spent ${data.get('expenses', 'N/A')}. "
            f"Your top spending category is {data.get('top_cat', 'N/A')}."
        )
    elif any(w in msg for w in ["income", "earn", "salary"]):
        return f"Your income this month is ${data.get('income', 'N/A')}."
    elif any(w in msg for w in ["saving", "save", "savings"]):
        return (
            f"Your current savings rate is {data.get('savings_rate', '0')}%. "
            "Try reducing discretionary spending to improve it."
        )
    elif any(w in msg for w in ["balance", "net"]):
        return f"Your all-time net balance is ${data.get('balance', 'N/A')}."
    elif any(w in msg for w in ["budget"]):
        return "Check your Budgets page to see category limits and current usage."
    else:
        return (
            f"This month: Income ${data.get('income', '0')}, "
            f"Expenses ${data.get('expenses', '0')}. "
            f"Top category: {data.get('top_cat', 'N/A')}. "
            "Ask me about your spending, income, savings, or budget!"
        )

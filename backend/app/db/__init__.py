from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    await _create_indexes()


async def _create_indexes():
    """Create indexes for query optimization."""
    # Expenses: user + date (most common query pattern)
    await db["expenses"].create_index([("user_id", 1), ("date", -1)])
    await db["expenses"].create_index([("user_id", 1), ("category", 1)])
    # Income: user + date
    await db["income"].create_index([("user_id", 1), ("date", -1)])
    # Budgets: unique per user+category
    await db["budgets"].create_index([("user_id", 1), ("category", 1)], unique=True)
    # Users: unique email
    await db["users"].create_index("email", unique=True)


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    return db
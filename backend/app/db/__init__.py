from motor.motor_asyncio import AsyncClient, AsyncDatabase
from app.config import settings

client: AsyncClient = None
db: AsyncDatabase = None


async def connect_to_mongo():
    global client, db
    client = AsyncClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")


def get_database() -> AsyncDatabase:
    return db

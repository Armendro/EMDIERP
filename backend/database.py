"""
Centralized database connection
"""
from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection - initialized once
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url) if mongo_url else None
db = client[os.environ.get('DB_NAME')] if client else None

def get_database():
    """Get database instance"""
    return db

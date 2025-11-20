"""
Centralized database connection
"""
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection - initialized once
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable not set")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

def get_database():
    """Get database instance"""
    return db

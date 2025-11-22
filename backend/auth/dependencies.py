from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from .jwt import decode_token

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to get current authenticated user from JWT token
    """
    from database import db
    from bson import ObjectId
    
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # Get user from database - try both ObjectId and string formats
    user = None
    try:
        # Try ObjectId first
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        # If ObjectId fails, try direct string match (for seed data)
        user = await db.users.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def require_roles(allowed_roles: List[str]):
    """
    Dependency factory to check if user has required role
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource"
            )
        return current_user
    return role_checker
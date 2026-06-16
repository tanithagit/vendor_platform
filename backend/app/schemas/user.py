from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.enums import UserRole

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    user_id: int

class TokenData(BaseModel):
    email: str | None = None
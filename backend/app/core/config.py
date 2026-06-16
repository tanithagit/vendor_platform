from pydantic_setting import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    #JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINITUES: int = 30
  
    #Sripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str =""

    #SendGrid
    SENDGRID_API_KEY: str
    FORM_EMAIL: str

    #Cloudinary
    CLOUDNARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    class Config:
        env_file = ".env"


   settings = Settings     
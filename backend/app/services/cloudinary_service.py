import cloudinary
import cloudinary.uploader
import os

# Get backend directory
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)
env_path = os.path.join(BASE_DIR, ".env")

# Read .env manually
env_vars = {}
with open(env_path, "r", encoding="utf-8-sig") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            env_vars[key.strip()] = value.strip().strip('"').strip("'")

# Configure Cloudinary
cloudinary.config(
    cloud_name=env_vars.get("CLOUDINARY_CLOUD_NAME"),
    api_key=env_vars.get("CLOUDINARY_API_KEY"),
    api_secret=env_vars.get("CLOUDINARY_API_SECRET")
)


def upload_file(file_bytes: bytes, folder: str, filename: str) -> str:
    """
    Upload file to Cloudinary
    Returns the secure URL of uploaded file
    """
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            public_id=filename,
            resource_type="auto"  # auto detects pdf, image, etc
        )
        return result.get("secure_url")
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")


def delete_file(public_id: str) -> bool:
    """Delete file from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        raise Exception(f"Cloudinary delete failed: {str(e)}")
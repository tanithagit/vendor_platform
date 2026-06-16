from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.v1 import auth

app = FastAPI(
    title="Procurement Platform API",
    description="Vendor Management & Procurement SaaS Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Procurement Platform API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Override OpenAPI schema to use Bearer token input
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Procurement Platform API",
        version="1.0.0",
        description="Vendor Management & Procurement SaaS Platform",
        routes=app.routes,
    )

    # Change security scheme to Bearer token (paste method)
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Apply to all routes
    for path in openapi_schema.get("paths", {}).values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
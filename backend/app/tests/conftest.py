import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

# Use separate test database
TEST_DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/procurement_test_db"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def override_get_db():
    """Use test database instead of real database"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables before tests, drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db():
    """Fresh database session for each test"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db):
    """Test client with overridden database"""
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ── Reusable Test Data Fixtures ───────────────────────────
@pytest.fixture
def employee_data():
    return {
        "name": "Test Employee",
        "email": "testemployee@test.com",
        "password": "test123",
        "role": "employee"
    }


@pytest.fixture
def manager_data():
    return {
        "name": "Test Manager",
        "email": "testmanager@test.com",
        "password": "test123",
        "role": "manager"
    }


@pytest.fixture
def vendor_data():
    return {
        "name": "Test Vendor",
        "email": "testvendor@test.com",
        "password": "test123",
        "role": "vendor"
    }


@pytest.fixture
def admin_data():
    return {
        "name": "Test Admin",
        "email": "testadmin@test.com",
        "password": "test123",
        "role": "admin"
    }


def get_token(client, email: str, password: str) -> str:
    """Helper to get JWT token"""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    return response.json()["access_token"]


def auth_headers(token: str) -> dict:
    """Helper to create auth headers"""
    return {"Authorization": f"Bearer {token}"}
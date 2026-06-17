import pytest
from fastapi.testclient import TestClient
from app.tests.conftest import get_token, auth_headers


class TestRegister:
    """Test user registration"""

    def test_register_employee_success(self, client, employee_data):
        """Test successful employee registration"""
        response = client.post(
            "/api/v1/auth/register",
            json=employee_data
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == employee_data["email"]
        assert data["role"] == "employee"
        assert "hashed_password" not in data

    def test_register_manager_success(self, client, manager_data):
        """Test successful manager registration"""
        response = client.post(
            "/api/v1/auth/register",
            json=manager_data
        )
        assert response.status_code == 201
        assert response.json()["role"] == "manager"

    def test_register_duplicate_email(self, client, employee_data):
        """Test duplicate email registration fails"""
        # Register first time
        client.post("/api/v1/auth/register", json=employee_data)

        # Register second time with same email
        response = client.post(
            "/api/v1/auth/register",
            json=employee_data
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_register_invalid_email(self, client):
        """Test registration with invalid email fails"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Test",
                "email": "not-an-email",
                "password": "test123",
                "role": "employee"
            }
        )
        assert response.status_code == 422

    def test_register_invalid_role(self, client):
        """Test registration with invalid role fails"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Test",
                "email": "test@test.com",
                "password": "test123",
                "role": "superuser"
            }
        )
        assert response.status_code == 422


class TestLogin:
    """Test user login"""

    def test_login_success(self, client, employee_data):
        """Test successful login returns JWT token"""
        # Register first
        client.post("/api/v1/auth/register", json=employee_data)

        # Login
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": employee_data["email"],
                "password": employee_data["password"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "employee"

    def test_login_wrong_password(self, client, employee_data):
        """Test login with wrong password fails"""
        client.post("/api/v1/auth/register", json=employee_data)

        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": employee_data["email"],
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user fails"""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nobody@test.com",
                "password": "test123"
            }
        )
        assert response.status_code == 401

    def test_login_returns_correct_role(self, client, manager_data):
        """Test login returns correct role in token"""
        client.post("/api/v1/auth/register", json=manager_data)

        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": manager_data["email"],
                "password": manager_data["password"]
            }
        )
        assert response.json()["role"] == "manager"
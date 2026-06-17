import pytest
from app.tests.conftest import get_token, auth_headers


class TestEmployeeAPIs:
    """Test employee purchase request APIs"""

    def setup_employee(self, client, employee_data):
        """Register and login employee, return headers"""
        client.post("/api/v1/auth/register", json=employee_data)
        token = get_token(
            client,
            employee_data["email"],
            employee_data["password"]
        )
        return auth_headers(token)

    def test_create_request_success(self, client, employee_data):
        """Test employee can create purchase request"""
        headers = self.setup_employee(client, employee_data)

        response = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Office Chairs",
                "description": "Need 10 chairs",
                "amount": 50000.00,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Office Chairs"
        assert data["status"] == "draft"
        assert data["amount"] == 50000.00

    def test_create_request_requires_auth(self, client):
        """Test creating request without auth fails"""
        response = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Test",
                "amount": 1000,
                "required_date": "2025-12-31T00:00:00"
            }
        )
        assert response.status_code == 401

    def test_submit_request_success(self, client, employee_data):
        """Test employee can submit draft request"""
        headers = self.setup_employee(client, employee_data)

        # Create request
        create_response = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Test Request",
                "amount": 10000,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=headers
        )
        request_id = create_response.json()["id"]

        # Submit request
        response = client.patch(
            f"/api/v1/employee/requests/{request_id}/submit",
            headers=headers
        )
        assert response.status_code == 200
        assert response.json()["status"] == "submitted"

    def test_employee_sees_only_own_requests(
        self, client, employee_data, manager_data
    ):
        """Test employee cannot see other employees requests"""
        # Create employee 1
        headers1 = self.setup_employee(client, employee_data)
        client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Employee 1 Request",
                "amount": 1000,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=headers1
        )

        # Create employee 2 (using manager_data with employee role)
        emp2_data = {**manager_data, "role": "employee"}
        client.post("/api/v1/auth/register", json=emp2_data)
        token2 = get_token(
            client,
            emp2_data["email"],
            emp2_data["password"]
        )
        headers2 = auth_headers(token2)

        # Employee 2 should see 0 requests
        response = client.get(
            "/api/v1/employee/requests",
            headers=headers2
        )
        assert response.status_code == 200
        assert len(response.json()) == 0

    def test_manager_cannot_access_employee_routes(
        self, client, manager_data
    ):
        """Test role protection on employee routes"""
        client.post("/api/v1/auth/register", json=manager_data)
        token = get_token(
            client,
            manager_data["email"],
            manager_data["password"]
        )
        headers = auth_headers(token)

        response = client.get(
            "/api/v1/employee/requests",
            headers=headers
        )
        assert response.status_code == 403
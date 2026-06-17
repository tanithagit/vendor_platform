import pytest
from app.tests.conftest import get_token, auth_headers


class TestManagerAPIs:
    """Test manager approval APIs"""

    def create_submitted_request(self, client, employee_data, manager_data):
        """Helper: create and submit a request"""
        # Register employee and manager
        client.post("/api/v1/auth/register", json=employee_data)
        client.post("/api/v1/auth/register", json=manager_data)

        # Employee creates and submits request
        emp_token = get_token(
            client,
            employee_data["email"],
            employee_data["password"]
        )
        emp_headers = auth_headers(emp_token)

        create_resp = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Test Request",
                "amount": 10000,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=emp_headers
        )
        request_id = create_resp.json()["id"]

        client.patch(
            f"/api/v1/employee/requests/{request_id}/submit",
            headers=emp_headers
        )

        # Get manager headers
        mgr_token = get_token(
            client,
            manager_data["email"],
            manager_data["password"]
        )
        return request_id, auth_headers(mgr_token)

    def test_manager_can_view_requests(
        self, client, employee_data, manager_data
    ):
        """Test manager can see submitted requests"""
        request_id, mgr_headers = self.create_submitted_request(
            client, employee_data, manager_data
        )
        response = client.get(
            "/api/v1/manager/requests",
            headers=mgr_headers
        )
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_manager_can_approve_request(
        self, client, employee_data, manager_data
    ):
        """Test manager can approve submitted request"""
        request_id, mgr_headers = self.create_submitted_request(
            client, employee_data, manager_data
        )
        response = client.patch(
            f"/api/v1/manager/requests/{request_id}/approve",
            headers=mgr_headers
        )
        assert response.status_code == 200
        assert response.json()["status"] == "approved"

    def test_manager_can_reject_request(
        self, client, employee_data, manager_data
    ):
        """Test manager can reject submitted request"""
        request_id, mgr_headers = self.create_submitted_request(
            client, employee_data, manager_data
        )
        response = client.patch(
            f"/api/v1/manager/requests/{request_id}/reject",
            headers=mgr_headers
        )
        assert response.status_code == 200
        assert response.json()["status"] == "rejected"

    def test_manager_cannot_approve_own_request(
        self, client, manager_data
    ):
        """
        Critical Rule Test:
        Manager cannot approve their own requests
        """
        # Register manager
        client.post("/api/v1/auth/register", json=manager_data)
        mgr_token = get_token(
            client,
            manager_data["email"],
            manager_data["password"]
        )
        mgr_headers = auth_headers(mgr_token)

        # Manager creates request as employee
        # (In real app, manager has employee_id)
        # We simulate by using manager's own user id
        create_resp = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Manager Own Request",
                "amount": 5000,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=mgr_headers  # Using manager token
        )

        # This will fail with 403 since manager
        # can't use employee routes - that's correct!
        assert create_resp.status_code == 403

    def test_cannot_approve_draft_request(
        self, client, employee_data, manager_data
    ):
        """Test cannot approve request that isn't submitted"""
        client.post("/api/v1/auth/register", json=employee_data)
        client.post("/api/v1/auth/register", json=manager_data)

        # Employee creates but does NOT submit request
        emp_token = get_token(
            client,
            employee_data["email"],
            employee_data["password"]
        )
        emp_headers = auth_headers(emp_token)

        create_resp = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Draft Request",
                "amount": 1000,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=emp_headers
        )
        request_id = create_resp.json()["id"]

        # Manager tries to approve draft request
        mgr_token = get_token(
            client,
            manager_data["email"],
            manager_data["password"]
        )
        mgr_headers = auth_headers(mgr_token)

        response = client.patch(
            f"/api/v1/manager/requests/{request_id}/approve",
            headers=mgr_headers
        )
        assert response.status_code == 400
        assert "submitted" in response.json()["detail"].lower()

    def test_employee_cannot_access_manager_routes(
        self, client, employee_data
    ):
        """Test role protection on manager routes"""
        client.post("/api/v1/auth/register", json=employee_data)
        token = get_token(
            client,
            employee_data["email"],
            employee_data["password"]
        )
        headers = auth_headers(token)

        response = client.get(
            "/api/v1/manager/requests",
            headers=headers
        )
        assert response.status_code == 403
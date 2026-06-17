import pytest
from app.tests.conftest import get_token, auth_headers


class TestProcurementWorkflow:
    """Test complete procurement workflow end to end"""

    def test_complete_workflow(
        self, client, employee_data,
        manager_data, admin_data
    ):
        """
        Test complete workflow:
        draft → submitted → approved → ordered
        """
        # Step 1: Register all users
        client.post("/api/v1/auth/register", json=employee_data)
        client.post("/api/v1/auth/register", json=manager_data)
        client.post("/api/v1/auth/register", json=admin_data)

        # Step 2: Employee creates request
        emp_token = get_token(
            client,
            employee_data["email"],
            employee_data["password"]
        )
        emp_headers = auth_headers(emp_token)

        create_resp = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Workflow Test Request",
                "amount": 100000,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=emp_headers
        )
        assert create_resp.status_code == 201
        request_id = create_resp.json()["id"]
        assert create_resp.json()["status"] == "draft"

        # Step 3: Employee submits request
        submit_resp = client.patch(
            f"/api/v1/employee/requests/{request_id}/submit",
            headers=emp_headers
        )
        assert submit_resp.status_code == 200
        assert submit_resp.json()["status"] == "submitted"

        # Step 4: Manager approves request
        mgr_token = get_token(
            client,
            manager_data["email"],
            manager_data["password"]
        )
        mgr_headers = auth_headers(mgr_token)

        approve_resp = client.patch(
            f"/api/v1/manager/requests/{request_id}/approve",
            headers=mgr_headers
        )
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "approved"

        # Step 5: Admin creates purchase order
        adm_token = get_token(
            client,
            admin_data["email"],
            admin_data["password"]
        )
        adm_headers = auth_headers(adm_token)

        # First create a vendor
        vendor_resp = client.post(
            "/api/v1/admin/vendors",
            json={
                "vendor_name": "Test Vendor Co",
                "email": "testvendorco@test.com",
                "phone": "1234567890",
                "address": "Test Address"
            },
            headers=adm_headers
        )
        assert vendor_resp.status_code == 201
        vendor_id = vendor_resp.json()["id"]

        # Create purchase order
        po_resp = client.post(
            "/api/v1/admin/purchase-orders",
            json={
                "request_id": request_id,
                "vendor_id": vendor_id,
                "total_amount": 100000
            },
            headers=adm_headers
        )
        assert po_resp.status_code == 201
        assert "order_number" in po_resp.json()

        # Verify request status changed to ordered
        status_resp = client.get(
            f"/api/v1/employee/requests/{request_id}",
            headers=emp_headers
        )
        assert status_resp.json()["status"] == "ordered"

    def test_cannot_create_po_for_unapproved_request(
        self, client, employee_data, admin_data
    ):
        """
        Critical Rule:
        Only approved requests can generate purchase orders
        """
        client.post("/api/v1/auth/register", json=employee_data)
        client.post("/api/v1/auth/register", json=admin_data)

        # Employee creates but does NOT get approved
        emp_token = get_token(
            client,
            employee_data["email"],
            employee_data["password"]
        )
        emp_headers = auth_headers(emp_token)

        create_resp = client.post(
            "/api/v1/employee/requests",
            json={
                "title": "Unapproved Request",
                "amount": 5000,
                "required_date": "2025-12-31T00:00:00"
            },
            headers=emp_headers
        )
        request_id = create_resp.json()["id"]

        # Admin tries to create PO for draft request
        adm_token = get_token(
            client,
            admin_data["email"],
            admin_data["password"]
        )
        adm_headers = auth_headers(adm_token)

        # Create vendor first
        vendor_resp = client.post(
            "/api/v1/admin/vendors",
            json={
                "vendor_name": "Test Co",
                "email": "testco@test.com"
            },
            headers=adm_headers
        )
        vendor_id = vendor_resp.json()["id"]

        # Try to create PO — should fail
        po_resp = client.post(
            "/api/v1/admin/purchase-orders",
            json={
                "request_id": request_id,
                "vendor_id": vendor_id,
                "total_amount": 5000
            },
            headers=adm_headers
        )
        assert po_resp.status_code == 400
        assert "approved" in po_resp.json()["detail"].lower()
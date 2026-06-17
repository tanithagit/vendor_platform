import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Read .env manually
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)
env_path = os.path.join(BASE_DIR, ".env")

env_vars = {}
with open(env_path, "r", encoding="utf-8-sig") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            env_vars[key.strip()] = value.strip().strip('"').strip("'")

SENDGRID_API_KEY = env_vars.get("SENDGRID_API_KEY")
FROM_EMAIL = env_vars.get("FROM_EMAIL")


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Base function to send email via SendGrid"""
    try:
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Email sent to {to_email} | Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")
        return False


# ── Email 1: Request Submitted ────────────────────────────
def send_request_submitted_email(
    manager_email: str,
    manager_name: str,
    employee_name: str,
    request_title: str,
    request_id: int,
    amount: float
):
    """Notify manager when employee submits a request"""
    subject = f"New Purchase Request: {request_title}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Purchase Request Submitted</h2>
        <p>Dear <strong>{manager_name}</strong>,</p>
        <p>A new purchase request has been submitted and requires your review.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Request Details</h3>
            <p><strong>Request ID:</strong> #{request_id}</p>
            <p><strong>Title:</strong> {request_title}</p>
            <p><strong>Submitted By:</strong> {employee_name}</p>
            <p><strong>Amount:</strong> ₹{amount:,.2f}</p>
            <p><strong>Status:</strong> Pending Review</p>
        </div>

        <p>Please login to the Procurement Platform to review and take action.</p>
        <a href="http://localhost:5173/manager/requests"
           style="background: #2563eb; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Request
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
            Procurement Platform | Automated Notification
        </p>
    </div>
    """
    return send_email(manager_email, subject, html_content)


# ── Email 2: Request Approved ─────────────────────────────
def send_request_approved_email(
    employee_email: str,
    employee_name: str,
    request_title: str,
    request_id: int,
    amount: float
):
    """Notify employee when their request is approved"""
    subject = f"✅ Purchase Request Approved: {request_title}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Purchase Request Approved! 🎉</h2>
        <p>Dear <strong>{employee_name}</strong>,</p>
        <p>Great news! Your purchase request has been approved.</p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;
                    margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin: 0 0 10px 0;">Request Details</h3>
            <p><strong>Request ID:</strong> #{request_id}</p>
            <p><strong>Title:</strong> {request_title}</p>
            <p><strong>Amount:</strong> ₹{amount:,.2f}</p>
            <p><strong>Status:</strong> ✅ Approved</p>
        </div>

        <p>The procurement team will now proceed with finding vendors and creating a purchase order.</p>
        <a href="http://localhost:5173/employee/requests/{request_id}"
           style="background: #16a34a; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            View Request
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
            Procurement Platform | Automated Notification
        </p>
    </div>
    """
    return send_email(employee_email, subject, html_content)


# ── Email 3: Request Rejected ─────────────────────────────
def send_request_rejected_email(
    employee_email: str,
    employee_name: str,
    request_title: str,
    request_id: int,
    amount: float
):
    """Notify employee when their request is rejected"""
    subject = f"❌ Purchase Request Rejected: {request_title}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Purchase Request Rejected</h2>
        <p>Dear <strong>{employee_name}</strong>,</p>
        <p>Unfortunately, your purchase request has been rejected.</p>

        <div style="background: #fef2f2; padding: 20px; border-radius: 8px;
                    margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin: 0 0 10px 0;">Request Details</h3>
            <p><strong>Request ID:</strong> #{request_id}</p>
            <p><strong>Title:</strong> {request_title}</p>
            <p><strong>Amount:</strong> ₹{amount:,.2f}</p>
            <p><strong>Status:</strong> ❌ Rejected</p>
        </div>

        <p>Please contact your manager for more information or submit a revised request.</p>
        <a href="http://localhost:5173/employee/requests"
           style="background: #dc2626; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            View My Requests
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
            Procurement Platform | Automated Notification
        </p>
    </div>
    """
    return send_email(employee_email, subject, html_content)


# ── Email 4: Purchase Order Created ──────────────────────
def send_purchase_order_email(
    vendor_email: str,
    vendor_name: str,
    order_number: str,
    order_id: int,
    total_amount: float
):
    """Notify vendor when a purchase order is created for them"""
    subject = f"New Purchase Order: {order_number}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Purchase Order Received</h2>
        <p>Dear <strong>{vendor_name}</strong>,</p>
        <p>A new purchase order has been created and assigned to you.</p>

        <div style="background: #faf5ff; padding: 20px; border-radius: 8px;
                    margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h3 style="margin: 0 0 10px 0;">Order Details</h3>
            <p><strong>Order Number:</strong> {order_number}</p>
            <p><strong>Order ID:</strong> #{order_id}</p>
            <p><strong>Total Amount:</strong> ₹{total_amount:,.2f}</p>
            <p><strong>Action Required:</strong> Please upload your invoice</p>
        </div>

        <p>Please login to upload your invoice for this purchase order.</p>
        <a href="http://localhost:5173/vendor/purchase-orders"
           style="background: #7c3aed; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            View Purchase Order
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
            Procurement Platform | Automated Notification
        </p>
    </div>
    """
    return send_email(vendor_email, subject, html_content)


# ── Email 5: Invoice Uploaded ─────────────────────────────
def send_invoice_uploaded_email(
    admin_email: str,
    vendor_name: str,
    order_number: str,
    invoice_id: int,
    amount: float
):
    """Notify admin when vendor uploads an invoice"""
    subject = f"Invoice Uploaded for Order: {order_number}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Invoice Ready for Payment</h2>
        <p>Dear <strong>Admin</strong>,</p>
        <p>A vendor has uploaded an invoice that requires payment processing.</p>

        <div style="background: #fff7ed; padding: 20px; border-radius: 8px;
                    margin: 20px 0; border-left: 4px solid #ea580c;">
            <h3 style="margin: 0 0 10px 0;">Invoice Details</h3>
            <p><strong>Invoice ID:</strong> #{invoice_id}</p>
            <p><strong>Vendor:</strong> {vendor_name}</p>
            <p><strong>Order Number:</strong> {order_number}</p>
            <p><strong>Amount:</strong> ₹{amount:,.2f}</p>
            <p><strong>Action Required:</strong> Process Payment</p>
        </div>

        <p>Please login to process the payment for this invoice.</p>
        <a href="http://localhost:5173/admin/invoices"
           style="background: #ea580c; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            Process Payment
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
            Procurement Platform | Automated Notification
        </p>
    </div>
    """
    return send_email(admin_email, subject, html_content)


# ── Email 6: Payment Completed ────────────────────────────
def send_payment_completed_email(
    vendor_email: str,
    vendor_name: str,
    order_number: str,
    payment_id: int,
    amount: float
):
    """Notify vendor when payment is completed"""
    subject = f"💰 Payment Received for Order: {order_number}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Payment Completed! 💰</h2>
        <p>Dear <strong>{vendor_name}</strong>,</p>
        <p>Your payment has been processed successfully.</p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;
                    margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin: 0 0 10px 0;">Payment Details</h3>
            <p><strong>Payment ID:</strong> #{payment_id}</p>
            <p><strong>Order Number:</strong> {order_number}</p>
            <p><strong>Amount Paid:</strong> ₹{amount:,.2f}</p>
            <p><strong>Status:</strong> ✅ Completed</p>
        </div>

        <p>Thank you for your service. We look forward to working with you again.</p>
        <a href="http://localhost:5173/vendor/dashboard"
           style="background: #16a34a; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
            Procurement Platform | Automated Notification
        </p>
    </div>
    """
    return send_email(vendor_email, subject, html_content)
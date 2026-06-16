import enum

class UserRole(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    vendor = "vendor"
    admin = "admin"

class RequestStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    ordered = "ordered"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta, date
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from pdf_generator import PDFGenerator
import jwt
from passlib.context import CryptContext
import shutil


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# PDF Generator
pdf_generator = PDFGenerator()

# Create PDFs directory if it doesn't exist
PDF_DIR = ROOT_DIR / 'pdfs'
PDF_DIR.mkdir(exist_ok=True)

# Create uploads directory for product images
UPLOADS_DIR = ROOT_DIR / 'uploads' / 'products'
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Email configuration
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', '')

# Admin authentication
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
JWT_SECRET = os.environ.get('JWT_SECRET', 'secret_key')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Add validation error handler for better debugging
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)[:500]}  # Include first 500 chars of body
    )

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Mount static files for product images under /api prefix to match ingress routing
app.mount("/api/uploads", StaticFiles(directory=str(ROOT_DIR / 'uploads')), name="uploads")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="new")

class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    message: str

class AdminLogin(BaseModel):
    username: str
    password: str

class ContactUpdate(BaseModel):
    status: str

# ============= USER MANAGEMENT MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    role: str = "user"  # "admin" or "user"
    status: str = "pending"  # "pending", "approved", "denied"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserApproval(BaseModel):
    status: str  # "approved" or "denied"

class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    action: str  # "create", "update", "delete", "view", "login", "logout"
    resource_type: str  # "quotation", "invoice", "product", "user"
    resource_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= QUOTATION & INVOICE MODELS =============

class ProductMaster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    model_no: str
    name: str
    description: str
    category: Optional[str] = None
    image_url: Optional[str] = None
    list_price: float
    company_cost: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductMasterCreate(BaseModel):
    model_no: str
    name: str
    description: str
    category: Optional[str] = None
    image_url: Optional[str] = None
    list_price: float
    company_cost: float

class ProductMasterUpdate(BaseModel):
    model_no: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    list_price: Optional[float] = None
    company_cost: Optional[float] = None

class QuotationItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_area: str  # e.g., "Hall", "Master Bedroom"
    switchboard_name: Optional[str] = None  # e.g., "4 Modular", "6 Modular", "Main Board"
    product_id: Optional[str] = None  # Reference to product master
    model_no: str
    product_name: str
    description: str
    image_url: Optional[str] = None
    quantity: int
    list_price: float
    discount: float = 0
    offered_price: float
    company_cost: float
    total_amount: float  # offered_price * quantity
    total_company_cost: float  # company_cost * quantity
    is_custom: bool = False  # True if cloned and edited

class QuotationItemCreate(BaseModel):
    room_area: str
    switchboard_name: Optional[str] = None
    product_id: Optional[str] = None
    model_no: str
    product_name: str
    description: str
    image_url: Optional[str] = None
    quantity: int
    list_price: float
    discount: float = 0
    offered_price: float
    company_cost: float
    is_custom: bool = False

class Quotation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote_number: str
    revision_no: int = 0
    
    # Customer information
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    architect_name: Optional[str] = None
    site_location: Optional[str] = None
    
    # Quotation details
    items: List[QuotationItem] = []
    
    # Pricing
    subtotal: float = 0
    overall_discount: float = 0
    net_quote: float = 0
    installation_charges: float = 0
    gst_percentage: float = 18
    gst_amount: float = 0
    total: float = 0
    
    # Internal tracking
    total_company_cost: float = 0
    profit_margin: float = 0
    
    # Terms
    validity_days: int = 15
    payment_terms: str = "50% advance, 50% before dispatch"
    terms_conditions: Optional[str] = None
    
    # Status tracking
    status: str = "draft"  # draft, sent, accepted, rejected, converted
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None  # User ID who created this quotation
    assigned_to: List[str] = []  # List of user IDs who can edit this quotation
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sent_at: Optional[datetime] = None
    
class QuotationCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    architect_name: Optional[str] = None
    site_location: Optional[str] = None
    items: List[QuotationItemCreate]
    overall_discount: float = 0
    installation_charges: float = 0
    gst_percentage: float = 18
    validity_days: int = 15
    payment_terms: str = "50% advance, 50% before dispatch"
    terms_conditions: Optional[str] = None

class QuotationUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    architect_name: Optional[str] = None
    site_location: Optional[str] = None
    items: Optional[List[QuotationItemCreate]] = None
    overall_discount: Optional[float] = None
    installation_charges: Optional[float] = None
    gst_percentage: Optional[float] = None
    validity_days: Optional[int] = None
    payment_terms: Optional[str] = None
    terms_conditions: Optional[str] = None
    status: Optional[str] = None

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    quotation_id: Optional[str] = None  # Reference to quotation if converted
    
    # Customer information
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    billing_address: Optional[str] = None
    
    # Invoice details
    items: List[QuotationItem] = []
    
    # Pricing
    subtotal: float = 0
    discount: float = 0
    net_amount: float = 0
    installation_charges: float = 0
    gst_percentage: float = 18
    gst_amount: float = 0
    total: float = 0
    
    # Payment tracking
    amount_paid: float = 0
    amount_due: float = 0
    payment_status: str = "pending"  # pending, partial, paid
    
    # Dates
    invoice_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    due_date: Optional[date] = None
    
    # Status
    status: str = "draft"  # draft, sent, paid, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sent_at: Optional[datetime] = None

class InvoiceCreate(BaseModel):
    quotation_id: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    billing_address: Optional[str] = None
    items: List[QuotationItemCreate]
    discount: float = 0
    installation_charges: float = 0
    gst_percentage: float = 18
    due_days: int = 30

class InvoiceUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    billing_address: Optional[str] = None
    items: Optional[List[QuotationItemCreate]] = None
    discount: Optional[float] = None
    installation_charges: Optional[float] = None
    gst_percentage: Optional[float] = None
    amount_paid: Optional[float] = None
    payment_status: Optional[str] = None
    status: Optional[str] = None

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = "company_settings"
    company_name: str = "InHaus Smart Automation"
    company_address: str = "Shop No 207, 1st Floor, Kokapet Terminal, Gandipet, Hyderabad - 500075"
    company_email: str = "support@inhaus.co.in"
    company_phone: str = "+91 7416925607"
    company_website: str = "www.inhaus.co.in"
    company_gstin: Optional[str] = "36AAICI44681ZL"
    company_cin: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_branch: Optional[str] = None
    upi_id: Optional[str] = None
    terms_template: Optional[str] = None
    warranty_info: Optional[str] = None

# Email sending function
async def send_email_notification(contact_data: dict):
    """Send email notification when a new contact form is submitted"""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'New Contact Form Submission from {contact_data["name"]}'
        msg['From'] = SMTP_USER
        msg['To'] = NOTIFICATION_EMAIL
        
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #f97316;">New Contact Form Submission</h2>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> {contact_data['name']}</p>
              <p><strong>Email:</strong> {contact_data['email']}</p>
              <p><strong>Phone:</strong> {contact_data.get('phone', 'Not provided')}</p>
              <p><strong>Message:</strong></p>
              <p style="background-color: white; padding: 10px; border-left: 3px solid #f97316;">
                {contact_data['message']}
              </p>
              <p><strong>Submitted:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              This is an automated notification from InHaus Smart Home contact form.
            </p>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email notification sent for contact from {contact_data['name']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification: {str(e)}")
        return False

# JWT token creation
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

# Verify JWT token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def log_activity(user_id: str, user_email: str, action: str, resource_type: str, resource_id: str = None, details: str = None):
    """Log user activity"""
    try:
        log_entry = ActivityLog(
            user_id=user_id,
            user_email=user_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details
        )
        doc = log_entry.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.activity_logs.insert_one(doc)
    except Exception as e:
        logger.error(f"Failed to log activity: {str(e)}")

async def check_admin(payload: dict):
    """Check if user is admin"""
    user_email = payload.get("sub")
    if user_email == ADMIN_USERNAME:
        return True
    user = await db.users.find_one({"email": user_email, "role": "admin", "status": "approved"}, {"_id": 0})
    return user is not None

async def check_quotation_access(quotation_id: str, user_id: str, is_admin: bool):
    """Check if user can edit quotation"""
    if is_admin:
        return True
    quotation = await db.quotations.find_one({"id": quotation_id}, {"_id": 0})
    if not quotation:
        return False
    # User can edit if they created it or if it's assigned to them
    return quotation.get("created_by") == user_id or user_id in quotation.get("assigned_to", [])

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/contact", response_model=ContactSubmission)
async def create_contact_submission(input: ContactSubmissionCreate):
    """Create a new contact form submission"""
    try:
        contact_dict = input.model_dump()
        contact_obj = ContactSubmission(**contact_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        result = await db.contact_submissions.insert_one(doc)
        
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to save contact submission")
        
        # Send email notification (non-blocking)
        await send_email_notification(contact_dict)
        
        return contact_obj
    except Exception as e:
        logger.error(f"Error creating contact submission: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/contact", response_model=List[ContactSubmission])
async def get_contact_submissions():
    """Get all contact form submissions"""
    try:
        # Exclude MongoDB's _id field from the query results
        contacts = await db.contact_submissions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
        
        # Convert ISO string timestamps back to datetime objects
        for contact in contacts:
            if isinstance(contact['timestamp'], str):
                contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
        
        return contacts
    except Exception as e:
        logger.error(f"Error fetching contact submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/contact/{contact_id}", response_model=ContactSubmission)
async def get_contact_submission(contact_id: str):
    """Get a specific contact submission by ID"""
    try:
        contact = await db.contact_submissions.find_one({"id": contact_id}, {"_id": 0})
        if not contact:
            raise HTTPException(status_code=404, detail="Contact submission not found")
        
        # Convert ISO string timestamp back to datetime object
        if isinstance(contact['timestamp'], str):
            contact['timestamp'] = datetime.fromisoformat(contact['timestamp'])
        
        return ContactSubmission(**contact)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching contact submission: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    """Admin/User login endpoint"""
    # Check if it's the main admin
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        access_token = create_access_token({"sub": credentials.username, "user_id": "admin", "role": "admin"})
        await log_activity("admin", ADMIN_USERNAME, "login", "auth")
        return {"access_token": access_token, "token_type": "bearer", "role": "admin", "user_id": "admin"}
    
    # Check if it's a registered user
    user = await db.users.find_one({"email": credentials.username}, {"_id": 0})
    if user and user.get("status") == "approved":
        if pwd_context.verify(credentials.password, user["password_hash"]):
            # Update last login
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
            )
            access_token = create_access_token({"sub": user["email"], "user_id": user["id"], "role": user["role"]})
            await log_activity(user["id"], user["email"], "login", "auth")
            return {"access_token": access_token, "token_type": "bearer", "role": user["role"], "user_id": user["id"]}
    
    raise HTTPException(status_code=401, detail="Invalid credentials or account not approved")

@api_router.post("/register")
async def register_user(user_data: UserRegister):
    """User registration endpoint"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        password_hash = pwd_context.hash(user_data.password)
        
        # Create user
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=password_hash,
            role="user",
            status="pending"
        )
        
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.users.insert_one(doc)
        
        return {"message": "Registration successful. Waiting for admin approval.", "status": "pending"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_user(payload: dict = Depends(verify_token)):
    """Get current user information"""
    try:
        user_email = payload.get("sub")
        user_id = payload.get("user_id")
        user_role = payload.get("role", "admin")
        
        # Check if it's the main admin
        if user_email == ADMIN_USERNAME:
            return {
                "id": "admin",
                "email": user_email,
                "name": "Admin",
                "role": "admin",
                "status": "approved"
            }
        
        # Get user from database
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching current user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users", response_model=List[dict])
async def get_users(payload: dict = Depends(verify_token)):
    """Get all users (admin only)"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
        
        # Convert datetime fields
        for user in users:
            if isinstance(user.get('created_at'), str):
                user['created_at'] = datetime.fromisoformat(user['created_at'])
            if user.get('last_login') and isinstance(user['last_login'], str):
                user['last_login'] = datetime.fromisoformat(user['last_login'])
        
        return users
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/users/{user_id}/approval")
async def approve_user(user_id: str, approval: UserApproval, payload: dict = Depends(verify_token)):
    """Approve or deny user registration (admin only)"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        if approval.status not in ["approved", "denied"]:
            raise HTTPException(status_code=400, detail="Status must be 'approved' or 'denied'")
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {"status": approval.status}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        await log_activity(payload.get("user_id"), payload.get("sub"), "update", "user", user_id, f"User {approval.status}")
        
        return {"message": f"User {approval.status} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/activity-logs", response_model=List[dict])
async def get_activity_logs(payload: dict = Depends(verify_token), limit: int = 100):
    """Get activity logs (admin only)"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        logs = await db.activity_logs.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
        
        # Convert datetime fields
        for log in logs:
            if isinstance(log.get('timestamp'), str):
                log['timestamp'] = datetime.fromisoformat(log['timestamp'])
        
        return logs
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching activity logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/contact/{contact_id}/status")
async def update_contact_status(contact_id: str, update: ContactUpdate, payload: dict = Depends(verify_token)):
    """Update contact submission status (admin only)"""
    try:
        result = await db.contact_submissions.update_one(
            {"id": contact_id},
            {"$set": {"status": update.status}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Contact submission not found")
        
        return {"message": "Status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating contact status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============= PRODUCT MASTER ENDPOINTS =============

@api_router.post("/products/upload-image")
async def upload_product_image(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    """Upload a product image (admin only)"""
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WEBP images are allowed")
        
        # Read file content to check size
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file size (5MB limit)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        if file_size > max_size:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOADS_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Return the URL path with /api prefix to match static files mount
        image_url = f"/api/uploads/products/{unique_filename}"
        return {"image_url": image_url, "message": "Image uploaded successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@api_router.post("/products", response_model=ProductMaster)
async def create_product(input: ProductMasterCreate, payload: dict = Depends(verify_token)):
    """Create a new product in master catalog (admin only)"""
    try:
        product_dict = input.model_dump()
        product_obj = ProductMaster(**product_dict)
        
        doc = product_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.products.insert_one(doc)
        return product_obj
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/products", response_model=List[ProductMaster])
async def get_products(payload: dict = Depends(verify_token)):
    """Get all products from master catalog (admin only)"""
    try:
        products = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        for product in products:
            if isinstance(product['created_at'], str):
                product['created_at'] = datetime.fromisoformat(product['created_at'])
            if isinstance(product['updated_at'], str):
                product['updated_at'] = datetime.fromisoformat(product['updated_at'])
        
        return products
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/products/{product_id}", response_model=ProductMaster)
async def get_product(product_id: str, payload: dict = Depends(verify_token)):
    """Get a specific product by ID (admin only)"""
    try:
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if isinstance(product['created_at'], str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product['updated_at'], str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
        
        return ProductMaster(**product)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.patch("/products/{product_id}", response_model=ProductMaster)
async def update_product(product_id: str, update: ProductMasterUpdate, payload: dict = Depends(verify_token)):
    """Update a product (admin only)"""
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.products.update_one(
            {"id": product_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if isinstance(product['created_at'], str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product['updated_at'], str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
        
        return ProductMaster(**product)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, payload: dict = Depends(verify_token)):
    """Delete a product (admin only)"""
    try:
        result = await db.products.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============= QUOTATION ENDPOINTS =============

def calculate_quotation_totals(items: List[QuotationItem], overall_discount: float, 
                               installation_charges: float, gst_percentage: float) -> Dict[str, float]:
    """Helper function to calculate quotation totals"""
    subtotal = sum(item.total_amount for item in items)
    net_quote = subtotal - overall_discount
    total_before_gst = net_quote + installation_charges
    gst_amount = (total_before_gst * gst_percentage) / 100
    total = total_before_gst + gst_amount
    total_company_cost = sum(item.total_company_cost for item in items)
    profit_margin = total - total_company_cost - gst_amount
    
    return {
        "subtotal": round(subtotal, 2),
        "net_quote": round(net_quote, 2),
        "gst_amount": round(gst_amount, 2),
        "total": round(total, 2),
        "total_company_cost": round(total_company_cost, 2),
        "profit_margin": round(profit_margin, 2)
    }

async def generate_quote_number() -> str:
    """Generate unique quote number"""
    count = await db.quotations.count_documents({})
    return f"QT-{datetime.now().year}-{count + 1:04d}"

@api_router.post("/quotations", response_model=Quotation)
async def create_quotation(input: QuotationCreate, payload: dict = Depends(verify_token)):
    """Create a new quotation (admin only)"""
    try:
        logger.info(f"Creating quotation for customer: {input.customer_name}, items count: {len(input.items)}")
        
        # Process items and calculate totals
        items = []
        for item_data in input.items:
            item_dict = item_data.model_dump()
            total_amount = item_dict['offered_price'] * item_dict['quantity']
            total_company_cost = item_dict['company_cost'] * item_dict['quantity']
            item_dict['total_amount'] = round(total_amount, 2)
            item_dict['total_company_cost'] = round(total_company_cost, 2)
            items.append(QuotationItem(**item_dict))
        
        # Calculate totals
        totals = calculate_quotation_totals(
            items, 
            input.overall_discount, 
            input.installation_charges, 
            input.gst_percentage
        )
        
        # Generate quote number
        quote_number = await generate_quote_number()
        
        # Create quotation object
        quotation_data = input.model_dump()
        quotation_data['items'] = [item.model_dump() for item in items]
        quotation_data['quote_number'] = quote_number
        quotation_data.update(totals)
        quotation_data['created_by'] = payload.get("user_id")  # Add creator
        quotation_data['assigned_to'] = []  # Initialize empty assignment list
        
        quotation_obj = Quotation(**quotation_data)
        
        # Save to database
        doc = quotation_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        if doc.get('sent_at'):
            doc['sent_at'] = doc['sent_at'].isoformat()
        
        await db.quotations.insert_one(doc)
        
        # Log activity
        await log_activity(payload.get("user_id"), payload.get("sub"), "create", "quotation", quotation_obj.id, f"Created quotation {quote_number}")
        
        return quotation_obj
    except Exception as e:
        logger.error(f"Error creating quotation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/quotations", response_model=List[Quotation])
async def get_quotations(payload: dict = Depends(verify_token)):
    """Get quotations - admin sees all, users see only their own"""
    try:
        is_admin = await check_admin(payload)
        user_id = payload.get("user_id")
        
        # Admin sees all, users see only their created ones
        if is_admin:
            raw_quotations = await db.quotations.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        else:
            raw_quotations = await db.quotations.find({"created_by": user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        quotations = []
        for quotation in raw_quotations:
            # Fix legacy converted-from-order documents with wrong schema
            if "quotation_number" in quotation and "quote_number" not in quotation:
                quotation["quote_number"] = quotation.pop("quotation_number")
            if "customer" in quotation and "customer_name" not in quotation:
                cust = quotation.pop("customer", {})
                quotation["customer_name"] = cust.get("name", "")
                quotation["customer_email"] = cust.get("email", "unknown@example.com")
                quotation["customer_phone"] = cust.get("phone", "")
                quotation["customer_address"] = cust.get("address", "")
            if "rooms" in quotation and "items" not in quotation:
                items = []
                for room in quotation.pop("rooms", []):
                    for item in room.get("items", []):
                        items.append({
                            "id": str(uuid.uuid4()),
                            "room_area": room.get("name", "General"),
                            "model_no": item.get("model_no", ""),
                            "product_name": item.get("name", item.get("product_name", "")),
                            "description": item.get("description", ""),
                            "image_url": item.get("image_url"),
                            "quantity": item.get("quantity", 1),
                            "list_price": item.get("list_price", 0),
                            "discount": 0,
                            "offered_price": item.get("offered_price", item.get("list_price", 0)),
                            "company_cost": item.get("company_cost", 0),
                            "total_amount": item.get("total_amount", 0),
                            "total_company_cost": item.get("company_cost", 0) * item.get("quantity", 1),
                            "is_custom": False
                        })
                quotation["items"] = items
            
            # Ensure required fields have defaults
            quotation.setdefault("revision_no", 0)
            quotation.setdefault("total_company_cost", 0)
            quotation.setdefault("profit_margin", 0)
            quotation.setdefault("payment_terms", "")
            quotation.setdefault("created_by", None)
            quotation.setdefault("assigned_to", [])
            quotation.setdefault("sent_at", None)
            
            if isinstance(quotation.get('created_at'), str):
                quotation['created_at'] = datetime.fromisoformat(quotation['created_at'])
            if isinstance(quotation.get('updated_at'), str):
                quotation['updated_at'] = datetime.fromisoformat(quotation['updated_at'])
            if quotation.get('sent_at') and isinstance(quotation['sent_at'], str):
                quotation['sent_at'] = datetime.fromisoformat(quotation['sent_at'])
            
            try:
                quotations.append(Quotation(**quotation))
            except Exception as parse_err:
                logger.warning(f"Skipping malformed quotation {quotation.get('id', 'unknown')}: {parse_err}")
                continue
        
        return quotations
    except Exception as e:
        logger.error(f"Error fetching quotations: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/quotations/{quotation_id}", response_model=Quotation)
async def get_quotation(quotation_id: str, payload: dict = Depends(verify_token)):
    """Get a specific quotation by ID (admin only)"""
    try:
        quotation = await db.quotations.find_one({"id": quotation_id}, {"_id": 0})
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        if isinstance(quotation['created_at'], str):
            quotation['created_at'] = datetime.fromisoformat(quotation['created_at'])
        if isinstance(quotation['updated_at'], str):
            quotation['updated_at'] = datetime.fromisoformat(quotation['updated_at'])
        if quotation.get('sent_at') and isinstance(quotation['sent_at'], str):
            quotation['sent_at'] = datetime.fromisoformat(quotation['sent_at'])
        
        return Quotation(**quotation)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching quotation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.patch("/quotations/{quotation_id}", response_model=Quotation)
async def update_quotation(quotation_id: str, update: QuotationUpdate, payload: dict = Depends(verify_token)):
    """Update a quotation (admin only)"""
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # If items are updated, recalculate totals
        if 'items' in update_data:
            items = []
            for item_data in update_data['items']:
                total_amount = item_data['offered_price'] * item_data['quantity']
                total_company_cost = item_data['company_cost'] * item_data['quantity']
                item_data['total_amount'] = round(total_amount, 2)
                item_data['total_company_cost'] = round(total_company_cost, 2)
                items.append(QuotationItem(**item_data))
            
            # Get existing quotation for discount and charges
            existing = await db.quotations.find_one({"id": quotation_id}, {"_id": 0})
            if not existing:
                raise HTTPException(status_code=404, detail="Quotation not found")
            
            overall_discount = update_data.get('overall_discount', existing.get('overall_discount', 0))
            installation_charges = update_data.get('installation_charges', existing.get('installation_charges', 0))
            gst_percentage = update_data.get('gst_percentage', existing.get('gst_percentage', 18))
            
            totals = calculate_quotation_totals(items, overall_discount, installation_charges, gst_percentage)
            update_data['items'] = [item.model_dump() for item in items]
            update_data.update(totals)
        
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.quotations.update_one(
            {"id": quotation_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        quotation = await db.quotations.find_one({"id": quotation_id}, {"_id": 0})
        if isinstance(quotation['created_at'], str):
            quotation['created_at'] = datetime.fromisoformat(quotation['created_at'])
        if isinstance(quotation['updated_at'], str):
            quotation['updated_at'] = datetime.fromisoformat(quotation['updated_at'])
        if quotation.get('sent_at') and isinstance(quotation.get('sent_at')):
            quotation['sent_at'] = datetime.fromisoformat(quotation['sent_at'])
        
        return Quotation(**quotation)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating quotation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.delete("/quotations/{quotation_id}")
async def delete_quotation(quotation_id: str, payload: dict = Depends(verify_token)):
    """Delete a quotation (admin only)"""
    try:
        result = await db.quotations.delete_one({"id": quotation_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Quotation not found")
        return {"message": "Quotation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting quotation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============= INVOICE ENDPOINTS =============

async def generate_invoice_number() -> str:
    """Generate unique invoice number"""
    count = await db.invoices.count_documents({})
    return f"INV-{datetime.now().year}-{count + 1:04d}"

def calculate_invoice_totals(items: List[QuotationItem], discount: float, 
                             installation_charges: float, gst_percentage: float) -> Dict[str, float]:
    """Helper function to calculate invoice totals"""
    subtotal = sum(item.total_amount for item in items)
    net_amount = subtotal - discount
    total_before_gst = net_amount + installation_charges
    gst_amount = (total_before_gst * gst_percentage) / 100
    total = total_before_gst + gst_amount
    
    return {
        "subtotal": round(subtotal, 2),
        "net_amount": round(net_amount, 2),
        "gst_amount": round(gst_amount, 2),
        "total": round(total, 2)
    }

@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(input: InvoiceCreate, payload: dict = Depends(verify_token)):
    """Create a new invoice (admin only)"""
    try:
        # Process items and calculate totals
        items = []
        for item_data in input.items:
            item_dict = item_data.model_dump()
            total_amount = item_dict['offered_price'] * item_dict['quantity']
            total_company_cost = item_dict['company_cost'] * item_dict['quantity']
            item_dict['total_amount'] = round(total_amount, 2)
            item_dict['total_company_cost'] = round(total_company_cost, 2)
            items.append(QuotationItem(**item_dict))
        
        # Calculate totals
        totals = calculate_invoice_totals(
            items, 
            input.discount, 
            input.installation_charges, 
            input.gst_percentage
        )
        
        # Generate invoice number
        invoice_number = await generate_invoice_number()
        
        # Calculate due date
        due_date = (datetime.now(timezone.utc) + timedelta(days=input.due_days)).date()
        
        # Create invoice object
        invoice_data = input.model_dump()
        invoice_data['items'] = [item.model_dump() for item in items]
        invoice_data['invoice_number'] = invoice_number
        invoice_data['due_date'] = due_date
        invoice_data['amount_due'] = totals['total']
        invoice_data.update(totals)
        
        invoice_obj = Invoice(**invoice_data)
        
        # Save to database
        doc = invoice_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        doc['invoice_date'] = doc['invoice_date'].isoformat()
        if doc.get('due_date'):
            doc['due_date'] = doc['due_date'].isoformat()
        if doc.get('sent_at'):
            doc['sent_at'] = doc['sent_at'].isoformat()
        
        await db.invoices.insert_one(doc)
        return invoice_obj
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(payload: dict = Depends(verify_token)):
    """Get all invoices (admin only)"""
    try:
        invoices = await db.invoices.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        for invoice in invoices:
            if isinstance(invoice['created_at'], str):
                invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
            if isinstance(invoice['updated_at'], str):
                invoice['updated_at'] = datetime.fromisoformat(invoice['updated_at'])
            if isinstance(invoice.get('invoice_date'), str):
                invoice['invoice_date'] = date.fromisoformat(invoice['invoice_date'])
            if invoice.get('due_date') and isinstance(invoice['due_date'], str):
                invoice['due_date'] = date.fromisoformat(invoice['due_date'])
            if invoice.get('sent_at') and isinstance(invoice['sent_at'], str):
                invoice['sent_at'] = datetime.fromisoformat(invoice['sent_at'])
        
        return invoices
    except Exception as e:
        logger.error(f"Error fetching invoices: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, payload: dict = Depends(verify_token)):
    """Get a specific invoice by ID (admin only)"""
    try:
        invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        if isinstance(invoice['created_at'], str):
            invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
        if isinstance(invoice['updated_at'], str):
            invoice['updated_at'] = datetime.fromisoformat(invoice['updated_at'])
        if isinstance(invoice.get('invoice_date'), str):
            invoice['invoice_date'] = date.fromisoformat(invoice['invoice_date'])
        if invoice.get('due_date') and isinstance(invoice['due_date'], str):
            invoice['due_date'] = date.fromisoformat(invoice['due_date'])
        if invoice.get('sent_at') and isinstance(invoice['sent_at'], str):
            invoice['sent_at'] = datetime.fromisoformat(invoice['sent_at'])
        
        return Invoice(**invoice)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching invoice: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.patch("/invoices/{invoice_id}", response_model=Invoice)
async def update_invoice(invoice_id: str, update: InvoiceUpdate, payload: dict = Depends(verify_token)):
    """Update an invoice (admin only)"""
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Get existing invoice
        existing = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # If items are updated, recalculate totals
        if 'items' in update_data:
            items = []
            for item_data in update_data['items']:
                total_amount = item_data['offered_price'] * item_data['quantity']
                total_company_cost = item_data['company_cost'] * item_data['quantity']
                item_data['total_amount'] = round(total_amount, 2)
                item_data['total_company_cost'] = round(total_company_cost, 2)
                items.append(QuotationItem(**item_data))
            
            discount = update_data.get('discount', existing.get('discount', 0))
            installation_charges = update_data.get('installation_charges', existing.get('installation_charges', 0))
            gst_percentage = update_data.get('gst_percentage', existing.get('gst_percentage', 18))
            
            totals = calculate_invoice_totals(items, discount, installation_charges, gst_percentage)
            update_data['items'] = [item.model_dump() for item in items]
            update_data.update(totals)
        
        # Update amount_due if amount_paid changed
        if 'amount_paid' in update_data:
            total = existing.get('total', 0)
            amount_paid = update_data['amount_paid']
            update_data['amount_due'] = round(total - amount_paid, 2)
            
            # Update payment status
            if amount_paid >= total:
                update_data['payment_status'] = 'paid'
            elif amount_paid > 0:
                update_data['payment_status'] = 'partial'
            else:
                update_data['payment_status'] = 'pending'
        
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        result = await db.invoices.update_one(
            {"id": invoice_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
        if isinstance(invoice['created_at'], str):
            invoice['created_at'] = datetime.fromisoformat(invoice['created_at'])
        if isinstance(invoice['updated_at'], str):
            invoice['updated_at'] = datetime.fromisoformat(invoice['updated_at'])
        if isinstance(invoice.get('invoice_date'), str):
            invoice['invoice_date'] = date.fromisoformat(invoice['invoice_date'])
        if invoice.get('due_date') and isinstance(invoice['due_date'], str):
            invoice['due_date'] = date.fromisoformat(invoice['due_date'])
        if invoice.get('sent_at') and isinstance(invoice.get('sent_at')):
            invoice['sent_at'] = datetime.fromisoformat(invoice['sent_at'])
        
        return Invoice(**invoice)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invoice: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, payload: dict = Depends(verify_token)):
    """Delete an invoice (admin only)"""
    try:
        result = await db.invoices.delete_one({"id": invoice_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return {"message": "Invoice deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting invoice: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============= SETTINGS ENDPOINTS =============

@api_router.get("/settings", response_model=Settings)
async def get_settings(payload: dict = Depends(verify_token)):
    """Get company settings (admin only)"""
    try:
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            # Initialize with default settings
            default_settings = Settings()
            await db.settings.insert_one(default_settings.model_dump())
            return default_settings
        return Settings(**settings)
    except Exception as e:
        logger.error(f"Error fetching settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/settings", response_model=Settings)
async def update_settings(settings: Settings, payload: dict = Depends(verify_token)):
    """Update company settings (admin only)"""
    try:
        settings_dict = settings.model_dump()
        settings_dict['id'] = "company_settings"
        
        await db.settings.update_one(
            {"id": "company_settings"},
            {"$set": settings_dict},
            upsert=True
        )
        
        return settings
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============= PDF GENERATION ENDPOINTS =============


@api_router.post("/quotations/{quotation_id}/generate-pdf")
async def generate_quotation_pdf(quotation_id: str, payload: dict = Depends(verify_token)):
    """Generate PDF for a quotation (admin only)"""
    try:
        # Get quotation
        quotation = await db.quotations.find_one({"id": quotation_id}, {"_id": 0})
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate PDF
        pdf_filename = f"quotation_{quotation['quote_number'].replace('/', '_')}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        pdf_generator.generate_quotation_pdf(quotation, settings, str(pdf_path))
        
        return {
            "message": "PDF generated successfully",
            "filename": pdf_filename,
            "path": str(pdf_path)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating quotation PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/quotations/{quotation_id}/download-pdf")
async def download_quotation_pdf(quotation_id: str, payload: dict = Depends(verify_token)):
    """Download PDF for a quotation (admin only)"""
    try:
        # Get quotation
        quotation = await db.quotations.find_one({"id": quotation_id}, {"_id": 0})
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate PDF with timestamp to ensure uniqueness
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"quotation_{quotation['quote_number'].replace('/', '_')}_{timestamp}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        # Always regenerate PDF to ensure latest data
        pdf_generator.generate_quotation_pdf(quotation, settings, str(pdf_path))
        
        # Return with strict no-cache headers
        return FileResponse(
            path=str(pdf_path),
            media_type='application/pdf',
            filename=f"quotation_{quotation['quote_number'].replace('/', '_')}.pdf",
            headers={
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading quotation PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/invoices/{invoice_id}/generate-pdf")
async def generate_invoice_pdf(invoice_id: str, payload: dict = Depends(verify_token)):
    """Generate PDF for an invoice (admin only)"""
    try:
        # Get invoice
        invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate PDF
        pdf_filename = f"invoice_{invoice['invoice_number'].replace('/', '_')}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        pdf_generator.generate_invoice_pdf(invoice, settings, str(pdf_path))
        
        return {
            "message": "PDF generated successfully",
            "filename": pdf_filename,
            "path": str(pdf_path)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating invoice PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/invoices/{invoice_id}/download-pdf")
async def download_invoice_pdf(invoice_id: str, payload: dict = Depends(verify_token)):
    """Download PDF for an invoice (admin only)"""
    try:
        # Get invoice
        invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate PDF with timestamp to ensure uniqueness
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"invoice_{invoice['invoice_number'].replace('/', '_')}_{timestamp}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        # Always regenerate PDF to ensure latest data
        pdf_generator.generate_invoice_pdf(invoice, settings, str(pdf_path))
        
        # Return with strict no-cache headers
        return FileResponse(
            path=str(pdf_path),
            media_type='application/pdf',
            filename=f"invoice_{invoice['invoice_number'].replace('/', '_')}.pdf",
            headers={
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading invoice PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= EMAIL SENDING ENDPOINTS =============

async def send_quotation_email(quotation_data: dict, pdf_path: str, settings_data: dict):
    """Send quotation email with PDF attachment"""
    try:
        msg = MIMEMultipart()
        msg['Subject'] = f'Quotation {quotation_data["quote_number"]} from {settings_data.get("company_name", "InHaus")}'
        msg['From'] = SMTP_USER
        msg['To'] = quotation_data['customer_email']
        
        # Email body
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #f97316;">Quotation from {settings_data.get('company_name', 'InHaus Smart Automation')}</h2>
            <p>Dear {quotation_data['customer_name']},</p>
            <p>Thank you for your interest in our smart home automation solutions.</p>
            <p>Please find attached our quotation <b>{quotation_data['quote_number']}</b> for your review.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Quotation Summary:</strong></p>
              <p><strong>Total Amount:</strong> ₹ {quotation_data['total']:,.2f}</p>
              <p><strong>Valid Until:</strong> {quotation_data['validity_days']} days from quotation date</p>
              <p><strong>Payment Terms:</strong> {quotation_data['payment_terms']}</p>
            </div>
            
            <p>Should you have any questions or require clarification, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br/>
            {settings_data.get('company_name', 'InHaus Smart Automation')}<br/>
            {settings_data.get('company_email', '')}<br/>
            {settings_data.get('company_phone', '')}</p>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        
        # Attach PDF
        with open(pdf_path, 'rb') as f:
            pdf_attachment = MIMEApplication(f.read(), _subtype='pdf')
            pdf_attachment.add_header('Content-Disposition', 'attachment', 
                                     filename=Path(pdf_path).name)
            msg.attach(pdf_attachment)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Quotation email sent to {quotation_data['customer_email']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send quotation email: {str(e)}")
        raise Exception(f"Email sending failed: {str(e)}")

async def send_invoice_email(invoice_data: dict, pdf_path: str, settings_data: dict):
    """Send invoice email with PDF attachment"""
    try:
        msg = MIMEMultipart()
        msg['Subject'] = f'Invoice {invoice_data["invoice_number"]} from {settings_data.get("company_name", "InHaus")}'
        msg['From'] = SMTP_USER
        msg['To'] = invoice_data['customer_email']
        
        # Email body
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #f97316;">Invoice from {settings_data.get('company_name', 'InHaus Smart Automation')}</h2>
            <p>Dear {invoice_data['customer_name']},</p>
            <p>Thank you for your business.</p>
            <p>Please find attached invoice <b>{invoice_data['invoice_number']}</b> for your records.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Invoice Summary:</strong></p>
              <p><strong>Total Amount:</strong> ₹ {invoice_data['total']:,.2f}</p>
              <p><strong>Amount Paid:</strong> ₹ {invoice_data['amount_paid']:,.2f}</p>
              <p><strong>Amount Due:</strong> ₹ {invoice_data['amount_due']:,.2f}</p>
              <p><strong>Payment Status:</strong> {invoice_data['payment_status'].upper()}</p>
              <p><strong>Due Date:</strong> {invoice_data.get('due_date', 'N/A')}</p>
            </div>
            
            <p>Please process the payment at your earliest convenience.</p>
            
            <p>Best regards,<br/>
            {settings_data.get('company_name', 'InHaus Smart Automation')}<br/>
            {settings_data.get('company_email', '')}<br/>
            {settings_data.get('company_phone', '')}</p>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        
        # Attach PDF
        with open(pdf_path, 'rb') as f:
            pdf_attachment = MIMEApplication(f.read(), _subtype='pdf')
            pdf_attachment.add_header('Content-Disposition', 'attachment', 
                                     filename=Path(pdf_path).name)
            msg.attach(pdf_attachment)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Invoice email sent to {invoice_data['customer_email']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send invoice email: {str(e)}")
        raise Exception(f"Email sending failed: {str(e)}")

@api_router.post("/quotations/{quotation_id}/send-email")
async def send_quotation_email_endpoint(quotation_id: str, payload: dict = Depends(verify_token)):
    """Generate PDF and send quotation via email (admin only)"""
    try:
        # Get quotation
        quotation = await db.quotations.find_one({"id": quotation_id}, {"_id": 0})
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate PDF
        pdf_filename = f"quotation_{quotation['quote_number'].replace('/', '_')}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        pdf_generator.generate_quotation_pdf(quotation, settings, str(pdf_path))
        
        # Try to send email, but don't fail if email fails
        email_sent = False
        email_error = None
        try:
            await send_quotation_email(quotation, str(pdf_path), settings)
            email_sent = True
        except Exception as email_ex:
            email_error = str(email_ex)
            logger.error(f"Email sending failed but PDF generated: {email_error}")
        
        # Update quotation status
        await db.quotations.update_one(
            {"id": quotation_id},
            {"$set": {
                "status": "sent",
                "sent_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if email_sent:
            return {"message": "Quotation sent successfully via email", "pdf_generated": True, "email_sent": True}
        else:
            return {
                "message": f"PDF generated successfully but email failed: {email_error}. Please download PDF and send manually.",
                "pdf_generated": True,
                "email_sent": False,
                "pdf_path": str(pdf_path),
                "error": email_error
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending quotation email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/invoices/{invoice_id}/send-email")
async def send_invoice_email_endpoint(invoice_id: str, payload: dict = Depends(verify_token)):
    """Generate PDF and send invoice via email (admin only)"""
    try:
        # Get invoice
        invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate PDF
        pdf_filename = f"invoice_{invoice['invoice_number'].replace('/', '_')}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        pdf_generator.generate_invoice_pdf(invoice, settings, str(pdf_path))
        
        # Try to send email, but don't fail if email fails
        email_sent = False
        email_error = None
        try:
            await send_invoice_email(invoice, str(pdf_path), settings)
            email_sent = True
        except Exception as email_ex:
            email_error = str(email_ex)
            logger.error(f"Email sending failed but PDF generated: {email_error}")
        
        # Update invoice status
        await db.invoices.update_one(
            {"id": invoice_id},
            {"$set": {
                "status": "sent",
                "sent_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if email_sent:
            return {"message": "Invoice sent successfully via email", "pdf_generated": True, "email_sent": True}
        else:
            return {
                "message": f"PDF generated successfully but email failed: {email_error}. Please download PDF and send manually.",
                "pdf_generated": True,
                "email_sent": False,
                "pdf_path": str(pdf_path),
                "error": email_error
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending invoice email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= E-COMMERCE MODELS =============

class CartItem(BaseModel):
    product_id: str
    product_name: str
    model_no: str
    image_url: Optional[str] = None
    price: float
    quantity: int
    total: float

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    model_no: str
    image_url: Optional[str] = None
    list_price: float
    company_cost: float
    quantity: int
    total_price: float
    total_cost: float

class CustomerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    pincode: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    customer: CustomerInfo
    items: List[OrderItem]
    subtotal: float
    tax_percentage: float = 18.0
    tax_amount: float
    total: float
    profit_margin: float
    total_cost: float
    payment_method: str  # 'razorpay', 'cod', 'manual'
    payment_status: str = 'pending'  # 'pending', 'paid', 'failed'
    payment_id: Optional[str] = None
    order_status: str = 'pending'  # 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    customer: CustomerInfo
    items: List[CartItem]
    payment_method: str

# ============= E-COMMERCE / SHOP ENDPOINTS (PUBLIC) =============

@api_router.get("/shop/products")
async def get_shop_products():
    """Get all products for shop - PUBLIC endpoint (no profit/cost data)"""
    try:
        products = await db.products.find(
            {},
            {
                "_id": 0,
                "id": 1,
                "name": 1,
                "model_no": 1,
                "description": 1,
                "category": 1,
                "image_url": 1,
                "list_price": 1,  # Only show selling price, not cost
                "created_at": 1
            }
        ).to_list(1000)
        
        return products
    except Exception as e:
        logger.error(f"Error fetching shop products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/shop/checkout")
async def create_order(checkout: CheckoutRequest):
    """Create new order from shop checkout - PUBLIC endpoint"""
    try:
        # Generate order number
        order_count = await db.orders.count_documents({})
        order_number = f"ORD-{datetime.now().year}-{order_count + 1:04d}"
        
        # Calculate order totals and profit
        order_items = []
        subtotal = 0
        total_cost = 0
        
        for cart_item in checkout.items:
            # Get full product details including cost
            product = await db.products.find_one({"id": cart_item.product_id}, {"_id": 0})
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
            
            item_total = product['list_price'] * cart_item.quantity
            item_cost = product['company_cost'] * cart_item.quantity
            
            order_item = OrderItem(
                product_id=cart_item.product_id,
                product_name=product['name'],
                model_no=product['model_no'],
                image_url=product.get('image_url'),
                list_price=product['list_price'],
                company_cost=product['company_cost'],
                quantity=cart_item.quantity,
                total_price=item_total,
                total_cost=item_cost
            )
            
            order_items.append(order_item)
            subtotal += item_total
            total_cost += item_cost
        
        # Calculate tax and total
        tax_amount = subtotal * 0.18  # 18% GST
        total = subtotal + tax_amount
        profit_margin = total - total_cost - tax_amount
        
        # Create order
        order = Order(
            order_number=order_number,
            customer=checkout.customer,
            items=order_items,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total=total,
            profit_margin=profit_margin,
            total_cost=total_cost,
            payment_method=checkout.payment_method,
            payment_status='pending' if checkout.payment_method == 'razorpay' else 'pending',
            order_status='pending'
        )
        
        # Save to database
        await db.orders.insert_one(order.model_dump())
        
        logger.info(f"Order created: {order_number} for customer: {checkout.customer.email}")
        
        return {
            "success": True,
            "order_id": order.id,
            "order_number": order_number,
            "total": total,
            "message": "Order created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= ADMIN ORDERS ENDPOINTS (WITH PROFIT DATA) =============

@api_router.get("/admin/orders")
async def get_admin_orders(payload: dict = Depends(verify_token)):
    """Get all orders with profit data - ADMIN ONLY"""
    try:
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        # Convert datetime to ISO format
        for order in orders:
            if isinstance(order.get('created_at'), datetime):
                order['created_at'] = order['created_at'].isoformat()
            if isinstance(order.get('updated_at'), datetime):
                order['updated_at'] = order['updated_at'].isoformat()
        
        return orders
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/admin/orders/{order_id}")
async def get_order_details(order_id: str, payload: dict = Depends(verify_token)):
    """Get order details with profit - ADMIN ONLY"""
    try:
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Convert datetime to ISO format
        if isinstance(order.get('created_at'), datetime):
            order['created_at'] = order['created_at'].isoformat()
        if isinstance(order.get('updated_at'), datetime):
            order['updated_at'] = order['updated_at'].isoformat()
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: dict,
    payload: dict = Depends(verify_token)
):
    """Update order status - ADMIN ONLY"""
    try:
        result = await db.orders.update_one(
            {"id": order_id},
            {
                "$set": {
                    "order_status": status.get('order_status'),
                    "payment_status": status.get('payment_status', None),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": "Order status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/admin/orders/{order_id}/download-invoice")
async def download_order_invoice(order_id: str, payload: dict = Depends(verify_token)):
    """Download invoice PDF for an order - ADMIN ONLY"""
    try:
        # Get order
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate invoice PDF
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"invoice_{order['order_number'].replace('/', '_')}_{timestamp}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        # Use invoice generator (we'll create this)
        pdf_generator.generate_order_invoice(order, settings, str(pdf_path))
        
        # Return with no-cache headers
        return FileResponse(
            path=str(pdf_path),
            media_type='application/pdf',
            filename=f"invoice_{order['order_number'].replace('/', '_')}.pdf",
            headers={
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    client.close()

# ============= CUSTOMER AUTHENTICATION MODELS =============

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = Field(default_factory=lambda: f"cust_{uuid.uuid4().hex[:12]}")
    email: EmailStr
    name: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    shipping_address: Optional[str] = None
    billing_address: Optional[str] = None
    auth_provider: str = "email"  # "email" or "google"
    password_hash: Optional[str] = None
    status: str = "active"  # "active", "inactive"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None

class CustomerRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: Optional[str] = None

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class CustomerSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Room model for cart items
class RoomCartItem(BaseModel):
    product_id: str
    product_name: str
    model_no: str
    image_url: Optional[str] = None
    price: float
    quantity: int
    room_name: str
    room_type: str  # "predefined" or "custom"

class CustomerCheckoutRequest(BaseModel):
    shipping_address: str
    billing_address: str
    same_as_shipping: bool = True
    items: List[RoomCartItem]
    payment_method: str

# ============= CUSTOMER AUTH ENDPOINTS =============

import httpx

async def get_customer_from_session(request: Request):
    """Get customer from session token - checks cookie first, then Authorization header"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    # Find session
    session = await db.customer_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get customer
    customer = await db.customers.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    return customer

@api_router.post("/customer/register")
async def customer_register(data: CustomerRegister):
    """Customer registration with email/password"""
    try:
        # Check if customer exists
        existing = await db.customers.find_one({"email": data.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        password_hash = pwd_context.hash(data.password)
        
        # Create customer
        customer = Customer(
            email=data.email,
            name=data.name,
            phone=data.phone,
            password_hash=password_hash,
            auth_provider="email"
        )
        
        doc = customer.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.customers.insert_one(doc)
        
        return {"message": "Registration successful", "user_id": customer.user_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Customer registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/customer/login")
async def customer_login(data: CustomerLogin, response: JSONResponse = None):
    """Customer login with email/password"""
    try:
        customer = await db.customers.find_one({"email": data.email}, {"_id": 0})
        
        if not customer:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if customer.get("auth_provider") == "google":
            raise HTTPException(status_code=400, detail="Please use Google Sign-in for this account")
        
        if not pwd_context.verify(data.password, customer.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create session
        session_token = f"sess_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = CustomerSession(
            user_id=customer["user_id"],
            session_token=session_token,
            expires_at=expires_at
        )
        
        doc = session.model_dump()
        doc['expires_at'] = doc['expires_at'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.customer_sessions.insert_one(doc)
        
        # Update last login
        await db.customers.update_one(
            {"user_id": customer["user_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Return customer data with session token
        return {
            "user_id": customer["user_id"],
            "email": customer["email"],
            "name": customer["name"],
            "picture": customer.get("picture"),
            "session_token": session_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Customer login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/customer/google-session")
async def process_google_session(request: Request):
    """Process Google OAuth session_id and create customer session"""
    try:
        body = await request.json()
        session_id = body.get("session_id")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id required")
        
        # Call Emergent Auth to get user data
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_data = response.json()
        email = user_data.get("email")
        name = user_data.get("name")
        picture = user_data.get("picture")
        
        # Check if customer exists
        existing_customer = await db.customers.find_one({"email": email}, {"_id": 0})
        
        if existing_customer:
            user_id = existing_customer["user_id"]
            # Update customer info
            await db.customers.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": name,
                    "picture": picture,
                    "last_login": datetime.now(timezone.utc).isoformat()
                }}
            )
        else:
            # Create new customer
            user_id = f"cust_{uuid.uuid4().hex[:12]}"
            customer = Customer(
                user_id=user_id,
                email=email,
                name=name,
                picture=picture,
                auth_provider="google"
            )
            
            doc = customer.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            
            await db.customers.insert_one(doc)
        
        # Create session
        session_token = f"sess_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = CustomerSession(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at
        )
        
        doc = session.model_dump()
        doc['expires_at'] = doc['expires_at'].isoformat()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.customer_sessions.insert_one(doc)
        
        return {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "session_token": session_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google session error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/customer/me")
async def get_customer_profile(request: Request):
    """Get current customer profile"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return customer

@api_router.post("/customer/logout")
async def customer_logout(request: Request):
    """Logout customer and clear session"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if session_token:
        await db.customer_sessions.delete_one({"session_token": session_token})
    
    return {"message": "Logged out successfully"}

# ============= ROOM MANAGEMENT ENDPOINTS =============

DEFAULT_ROOMS = [
    "Living Room",
    "Master Bedroom",
    "Bedroom 2",
    "Bedroom 3",
    "Kitchen",
    "Bathroom",
    "Office/Study",
    "Dining Room",
    "Balcony",
    "Hall"
]

@api_router.get("/rooms/default")
async def get_default_rooms():
    """Get list of predefined room types"""
    return {"rooms": DEFAULT_ROOMS}

@api_router.get("/customer/rooms")
async def get_customer_rooms(request: Request):
    """Get customer's custom rooms"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    custom_rooms = await db.custom_rooms.find(
        {"user_id": customer["user_id"]},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "default_rooms": DEFAULT_ROOMS,
        "custom_rooms": [r["name"] for r in custom_rooms]
    }

@api_router.post("/customer/rooms")
async def add_custom_room(request: Request):
    """Add a custom room for customer"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    body = await request.json()
    room_name = body.get("name")
    
    if not room_name:
        raise HTTPException(status_code=400, detail="Room name required")
    
    # Check if exists
    existing = await db.custom_rooms.find_one({
        "user_id": customer["user_id"],
        "name": room_name
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Room already exists")
    
    await db.custom_rooms.insert_one({
        "user_id": customer["user_id"],
        "name": room_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Room added", "name": room_name}

# ============= CUSTOMER ORDER ENDPOINTS =============

@api_router.post("/customer/checkout")
async def customer_checkout(data: CustomerCheckoutRequest, request: Request):
    """Customer checkout with room-based items"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Generate order number
        order_count = await db.customer_orders.count_documents({})
        order_number = f"INV-{datetime.now().year}-{order_count + 1:04d}"
        
        # Group items by room for display
        items_by_room = {}
        for item in data.items:
            room = item.room_name
            if room not in items_by_room:
                items_by_room[room] = []
            items_by_room[room].append(item)
        
        # Calculate totals
        order_items = []
        subtotal = 0
        total_cost = 0
        
        for item in data.items:
            product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            item_total = product['list_price'] * item.quantity
            item_cost = product.get('company_cost', 0) * item.quantity
            
            order_items.append({
                "product_id": item.product_id,
                "product_name": product['name'],
                "model_no": product['model_no'],
                "image_url": product.get('image_url'),
                "description": product.get('description', ''),
                "list_price": product['list_price'],
                "company_cost": product.get('company_cost', 0),
                "quantity": item.quantity,
                "total_price": item_total,
                "total_cost": item_cost,
                "room_name": item.room_name,
                "room_type": item.room_type
            })
            
            subtotal += item_total
            total_cost += item_cost
        
        # Calculate tax and total
        tax_percentage = 18.0
        tax_amount = subtotal * (tax_percentage / 100)
        total = subtotal + tax_amount
        profit_margin = total - total_cost - tax_amount
        
        # Create order
        order_id = str(uuid.uuid4())
        billing_address = data.billing_address if not data.same_as_shipping else data.shipping_address
        
        order = {
            "id": order_id,
            "order_number": order_number,
            "user_id": customer["user_id"],
            "customer_name": customer["name"],
            "customer_email": customer["email"],
            "customer_phone": customer.get("phone", ""),
            "shipping_address": data.shipping_address,
            "billing_address": billing_address,
            "items": order_items,
            "items_by_room": {room: [i.model_dump() for i in items] for room, items in items_by_room.items()},
            "subtotal": round(subtotal, 2),
            "tax_percentage": tax_percentage,
            "tax_amount": round(tax_amount, 2),
            "total": round(total, 2),
            "total_cost": round(total_cost, 2),
            "profit_margin": round(profit_margin, 2),
            "payment_method": data.payment_method,
            "payment_status": "pending",
            "order_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.customer_orders.insert_one(order)
        
        logger.info(f"Customer order created: {order_number} for {customer['email']}")
        
        return {
            "success": True,
            "order_id": order_id,
            "order_number": order_number,
            "total": round(total, 2),
            "message": "Order placed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Customer checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/customer/orders")
async def get_customer_orders(request: Request):
    """Get customer's order history"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    orders = await db.customer_orders.find(
        {"user_id": customer["user_id"]},
        {"_id": 0, "total_cost": 0, "profit_margin": 0}  # Hide internal data
    ).sort("created_at", -1).to_list(100)
    
    return orders

@api_router.get("/customer/orders/{order_id}")
async def get_customer_order_detail(order_id: str, request: Request):
    """Get customer's order detail"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    order = await db.customer_orders.find_one(
        {"id": order_id, "user_id": customer["user_id"]},
        {"_id": 0, "total_cost": 0, "profit_margin": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

@api_router.get("/customer/orders/{order_id}/invoice")
async def download_customer_invoice(order_id: str, request: Request):
    """Download invoice PDF for customer order"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    order = await db.customer_orders.find_one(
        {"id": order_id, "user_id": customer["user_id"]},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get settings
    settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
    if not settings:
        settings = Settings().model_dump()
    
    # Generate invoice PDF
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"invoice_{order['order_number'].replace('/', '_')}_{timestamp}.pdf"
    pdf_path = PDF_DIR / pdf_filename
    
    # Generate customer invoice with room grouping
    pdf_generator.generate_customer_invoice(order, settings, str(pdf_path))
    
    return FileResponse(
        path=str(pdf_path),
        media_type='application/pdf',
        filename=f"invoice_{order['order_number'].replace('/', '_')}.pdf",
        headers={
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    )

@api_router.post("/customer/orders/{order_id}/send-invoice")
async def send_customer_invoice_email(order_id: str, request: Request):
    """Send invoice to customer email"""
    customer = await get_customer_from_session(request)
    
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    order = await db.customer_orders.find_one(
        {"id": order_id, "user_id": customer["user_id"]},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get settings
    settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
    if not settings:
        settings = Settings().model_dump()
    
    # Generate invoice PDF
    pdf_filename = f"invoice_{order['order_number'].replace('/', '_')}.pdf"
    pdf_path = PDF_DIR / pdf_filename
    
    pdf_generator.generate_customer_invoice(order, settings, str(pdf_path))
    
    # Send email
    try:
        msg = MIMEMultipart()
        msg['Subject'] = f"Invoice {order['order_number']} - {settings.get('company_name', 'InHaus')}"
        msg['From'] = SMTP_USER
        msg['To'] = customer['email']
        
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #f97316;">Thank You for Your Order!</h2>
            <p>Dear {customer['name']},</p>
            <p>Your order <b>{order['order_number']}</b> has been received.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order Summary:</strong></p>
              <p><strong>Total Amount:</strong> ₹ {order['total']:,.2f}</p>
              <p><strong>Payment Method:</strong> {order['payment_method'].upper()}</p>
              <p><strong>Order Status:</strong> {order['order_status'].title()}</p>
            </div>
            
            <p>Please find your invoice attached.</p>
            
            <p>Best regards,<br/>
            {settings.get('company_name', 'InHaus Smart Automation')}<br/>
            {settings.get('company_phone', '')}</p>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, 'html'))
        
        with open(pdf_path, 'rb') as f:
            pdf_attachment = MIMEApplication(f.read(), _subtype='pdf')
            pdf_attachment.add_header('Content-Disposition', 'attachment', filename=Path(pdf_path).name)
            msg.attach(pdf_attachment)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        return {"message": "Invoice sent to your email", "email": customer['email']}
    except Exception as e:
        logger.error(f"Failed to send invoice email: {str(e)}")
        return {"message": "Invoice generated but email failed. Please download manually.", "error": str(e)}

# ============= ADMIN CUSTOMER MANAGEMENT =============

@api_router.get("/admin/customers")
async def get_all_customers(payload: dict = Depends(verify_token)):
    """Get all customers - ADMIN ONLY"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        customers = await db.customers.find(
            {},
            {"_id": 0, "password_hash": 0}
        ).sort("created_at", -1).to_list(1000)
        
        return customers
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching customers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/customers")
async def admin_create_customer(data: CustomerRegister, payload: dict = Depends(verify_token)):
    """Admin creates a customer account"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Check if customer exists
        existing = await db.customers.find_one({"email": data.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        password_hash = pwd_context.hash(data.password)
        
        # Create customer
        customer = Customer(
            email=data.email,
            name=data.name,
            phone=data.phone,
            password_hash=password_hash,
            auth_provider="email"
        )
        
        doc = customer.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.customers.insert_one(doc)
        
        return {"message": "Customer created successfully", "user_id": customer.user_id, "email": data.email}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin create customer error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/customer-orders")
async def get_all_customer_orders(payload: dict = Depends(verify_token)):
    """Get all customer orders with profit data - ADMIN ONLY"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        orders = await db.customer_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        return orders
    except Exception as e:
        logger.error(f"Error fetching customer orders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/admin/customer-orders/{order_id}/status")
async def update_customer_order_status(order_id: str, request: Request, payload: dict = Depends(verify_token)):
    """Update customer order status - ADMIN ONLY"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        body = await request.json()
        
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if "order_status" in body:
            update_data["order_status"] = body["order_status"]
        if "payment_status" in body:
            update_data["payment_status"] = body["payment_status"]
        
        result = await db.customer_orders.update_one(
            {"id": order_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": "Order status updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= ADMIN ORDER EDITING ENDPOINTS =============

class OrderEditRequest(BaseModel):
    """Request model for editing customer orders"""
    items: Optional[List[dict]] = None  # Updated items with prices
    discount_type: Optional[str] = None  # "percentage" or "fixed"
    discount_value: Optional[float] = 0
    include_gst: Optional[bool] = True
    gst_percentage: Optional[float] = 18.0
    notes: Optional[str] = None

@api_router.get("/admin/customer-orders/{order_id}")
async def get_customer_order_detail_admin(order_id: str, payload: dict = Depends(verify_token)):
    """Get single customer order details for editing - ADMIN ONLY"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        order = await db.customer_orders.find_one({"id": order_id}, {"_id": 0})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/admin/customer-orders/{order_id}/edit")
async def edit_customer_order(order_id: str, data: OrderEditRequest, payload: dict = Depends(verify_token)):
    """Edit customer order - update prices, apply discount, adjust GST - ADMIN ONLY"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        order = await db.customer_orders.find_one({"id": order_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        # Update items if provided
        items = data.items if data.items else order.get('items', [])
        
        # Recalculate totals
        subtotal = 0
        total_cost = 0
        
        for item in items:
            item_price = float(item.get('list_price', 0))
            item_qty = int(item.get('quantity', 1))
            item_cost = float(item.get('company_cost', 0))
            
            item['total_price'] = item_price * item_qty
            item['total_cost'] = item_cost * item_qty
            
            subtotal += item['total_price']
            total_cost += item['total_cost']
        
        update_data['items'] = items
        update_data['subtotal'] = round(subtotal, 2)
        update_data['total_cost'] = round(total_cost, 2)
        
        # Apply discount
        discount_amount = 0
        if data.discount_type and data.discount_value:
            if data.discount_type == "percentage":
                discount_amount = subtotal * (data.discount_value / 100)
            else:  # fixed
                discount_amount = data.discount_value
            
            update_data['discount_type'] = data.discount_type
            update_data['discount_value'] = data.discount_value
            update_data['discount_amount'] = round(discount_amount, 2)
        
        net_amount = subtotal - discount_amount
        
        # GST calculation
        include_gst = data.include_gst if data.include_gst is not None else True
        gst_percentage = data.gst_percentage if data.gst_percentage is not None else 18.0
        
        update_data['include_gst'] = include_gst
        update_data['tax_percentage'] = gst_percentage
        
        if include_gst:
            tax_amount = net_amount * (gst_percentage / 100)
        else:
            tax_amount = 0
        
        update_data['tax_amount'] = round(tax_amount, 2)
        
        # Final total
        total = net_amount + tax_amount
        update_data['total'] = round(total, 2)
        
        # Profit margin
        profit_margin = total - total_cost - tax_amount
        update_data['profit_margin'] = round(profit_margin, 2)
        
        # Notes
        if data.notes:
            update_data['admin_notes'] = data.notes
        
        # Update order
        result = await db.customer_orders.update_one(
            {"id": order_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")
        
        # Return updated order
        updated_order = await db.customer_orders.find_one({"id": order_id}, {"_id": 0})
        return updated_order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error editing order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/customer-orders/{order_id}/convert-to-quotation")
async def convert_order_to_quotation(order_id: str, payload: dict = Depends(verify_token)):
    """Convert a customer order to a quotation for further editing - ADMIN ONLY"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        order = await db.customer_orders.find_one({"id": order_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get next quotation number using the correct field name
        count = await db.quotations.count_documents({})
        quotation_number = f"QT-{datetime.now().year}-{(count + 1):04d}"
        
        # Create quotation from order using the correct Quotation schema
        quotation_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        # Convert order items to flat QuotationItem format
        quotation_items = []
        for item in order.get('items', []):
            list_price = item.get('list_price', 0)
            quantity = item.get('quantity', 1)
            company_cost = item.get('company_cost', 0)
            offered_price = item.get('offered_price', list_price)
            quotation_items.append({
                "id": str(uuid.uuid4()),
                "room_area": item.get('room_name', 'General'),
                "switchboard_name": None,
                "product_id": item.get('product_id'),
                "model_no": item.get('model_no', ''),
                "product_name": item.get('product_name', ''),
                "description": item.get('description', ''),
                "image_url": item.get('image_url'),
                "quantity": quantity,
                "list_price": list_price,
                "discount": 0,
                "offered_price": offered_price,
                "company_cost": company_cost,
                "total_amount": offered_price * quantity,
                "total_company_cost": company_cost * quantity,
                "is_custom": False
            })
        
        subtotal = sum(i["total_amount"] for i in quotation_items)
        overall_discount = order.get('discount_amount', 0)
        net_quote = subtotal - overall_discount
        gst_percentage = order.get('tax_percentage', 18)
        gst_amount = (net_quote * gst_percentage) / 100
        total = net_quote + gst_amount
        total_company_cost = sum(i["total_company_cost"] for i in quotation_items)
        
        quotation = {
            "id": quotation_id,
            "quote_number": quotation_number,
            "revision_no": 0,
            "customer_name": order.get('customer_name', ''),
            "customer_email": order.get('customer_email', ''),
            "customer_phone": order.get('customer_phone', ''),
            "customer_address": order.get('billing_address', ''),
            "architect_name": None,
            "site_location": None,
            "items": quotation_items,
            "subtotal": subtotal,
            "overall_discount": overall_discount,
            "net_quote": net_quote,
            "installation_charges": 0,
            "gst_percentage": gst_percentage,
            "gst_amount": gst_amount,
            "total": total,
            "total_company_cost": total_company_cost,
            "profit_margin": total - total_company_cost - gst_amount,
            "validity_days": 30,
            "payment_terms": "50% advance, 50% before dispatch",
            "terms_conditions": f"Converted from Order {order.get('order_number')}",
            "status": "draft",
            "created_by": payload.get("user_id"),
            "assigned_to": [],
            "created_at": now,
            "updated_at": now,
            "sent_at": None
        }
        
        await db.quotations.insert_one(quotation)
        
        # Update order to mark it as converted
        await db.customer_orders.update_one(
            {"id": order_id},
            {"$set": {
                "converted_to_quotation": quotation_id,
                "quotation_number": quotation_number,
                "updated_at": now.isoformat()
            }}
        )
        
        logger.info(f"Order {order_id} converted to quotation {quotation_number}")
        
        return {
            "message": "Order converted to quotation successfully",
            "quotation_id": quotation_id,
            "quotation_number": quotation_number
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting order to quotation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/customer-orders/{order_id}/invoice")
async def admin_download_customer_invoice(order_id: str, payload: dict = Depends(verify_token)):
    """Download invoice PDF for any customer order - ADMIN ONLY"""
    try:
        is_admin = await check_admin(payload)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        order = await db.customer_orders.find_one({"id": order_id}, {"_id": 0})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get settings
        settings = await db.settings.find_one({"id": "company_settings"}, {"_id": 0})
        if not settings:
            settings = Settings().model_dump()
        
        # Generate invoice PDF
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"invoice_{order['order_number'].replace('/', '_')}_{timestamp}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        # Generate customer invoice
        pdf_generator.generate_customer_invoice(order, settings, str(pdf_path))
        
        return FileResponse(
            path=str(pdf_path),
            media_type='application/pdf',
            filename=f"invoice_{order['order_number'].replace('/', '_')}.pdf",
            headers={
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating admin invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

# CORS configuration for production
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    # In production, use specific origins
    cors_origins_list = [
        "https://inhaus.co.in",
        "https://www.inhaus.co.in",
        "https://inhaus-connect.emergent.host",
        "http://localhost:3000",
        "http://localhost:8001"
    ]
else:
    cors_origins_list = cors_origins.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # Important for file downloads
    max_age=3600,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""

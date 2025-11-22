from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
import jwt
from passlib.context import CryptContext


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


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

class QuotationItemCreate(BaseModel):
    room_area: str
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
    company_address: str = ""
    company_email: str = "inhaussmartautomation@gmail.com"
    company_phone: str = "+91 9063555552"
    company_website: str = "www.inhaus.in"
    company_gstin: Optional[str] = None
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
    """Admin login endpoint"""
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        access_token = create_access_token({"sub": credentials.username})
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
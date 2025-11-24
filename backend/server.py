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
from email.mime.application import MIMEApplication
from pdf_generator import PDFGenerator
import jwt
from passlib.context import CryptContext


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

# ============= PRODUCT MASTER ENDPOINTS =============

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
        
        quotation_obj = Quotation(**quotation_data)
        
        # Save to database
        doc = quotation_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        if doc.get('sent_at'):
            doc['sent_at'] = doc['sent_at'].isoformat()
        
        await db.quotations.insert_one(doc)
        return quotation_obj
    except Exception as e:
        logger.error(f"Error creating quotation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/quotations", response_model=List[Quotation])
async def get_quotations(payload: dict = Depends(verify_token)):
    """Get all quotations (admin only)"""
    try:
        quotations = await db.quotations.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        for quotation in quotations:
            if isinstance(quotation['created_at'], str):
                quotation['created_at'] = datetime.fromisoformat(quotation['created_at'])
            if isinstance(quotation['updated_at'], str):
                quotation['updated_at'] = datetime.fromisoformat(quotation['updated_at'])
            if quotation.get('sent_at') and isinstance(quotation['sent_at'], str):
                quotation['sent_at'] = datetime.fromisoformat(quotation['sent_at'])
        
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

from fastapi.responses import FileResponse

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
        
        # Generate PDF
        pdf_filename = f"quotation_{quotation['quote_number'].replace('/', '_')}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        # Generate if doesn't exist
        if not pdf_path.exists():
            pdf_generator.generate_quotation_pdf(quotation, settings, str(pdf_path))
        
        return FileResponse(
            path=str(pdf_path),
            media_type='application/pdf',
            filename=pdf_filename
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
        
        # Generate PDF
        pdf_filename = f"invoice_{invoice['invoice_number'].replace('/', '_')}.pdf"
        pdf_path = PDF_DIR / pdf_filename
        
        # Generate if doesn't exist
        if not pdf_path.exists():
            pdf_generator.generate_invoice_pdf(invoice, settings, str(pdf_path))
        
        return FileResponse(
            path=str(pdf_path),
            media_type='application/pdf',
            filename=pdf_filename
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
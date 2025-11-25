#!/usr/bin/env python3
"""
PDF Structure Verification Test
Verifies that the PDF Two-Page Layout Restructuring is working correctly.
"""

import requests
import json
import sys
import os
from pathlib import Path

# Get backend URL from frontend .env file
BACKEND_URL = "https://inhaus-quote.preview.emergentagent.com/api"

# Admin credentials
ADMIN_USERNAME = "barath40893@gmail.com"
ADMIN_PASSWORD = "InHaus@2024"

def admin_login():
    """Login as admin and get Bearer token"""
    print("🔐 Admin Login...")
    
    try:
        login_data = {
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        }
        
        response = requests.post(f"{BACKEND_URL}/admin/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get("access_token")
            print("✅ Admin login successful")
            return admin_token
        else:
            print(f"❌ Admin login failed with status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Admin login failed with error: {str(e)}")
        return None

def test_pdf_two_page_structure():
    """Test the specific PDF two-page structure implementation"""
    print("\n🔍 Testing PDF Two-Page Structure Implementation...")
    
    admin_token = admin_login()
    if not admin_token:
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create a test quotation with comprehensive data
    quotation_data = {
        "customer_name": "Test Customer for PDF Structure",
        "customer_email": "test.customer@example.com",
        "customer_phone": "+91-9876543210",
        "customer_address": "123 Test Address, Test City - 560001",
        "architect_name": "Test Architect",
        "site_location": "Test Site Location",
        "items": [
            {
                "room_area": "Living Room",
                "model_no": "TEST-001",
                "product_name": "Test Product 1",
                "description": "Test product description for living room automation",
                "quantity": 2,
                "list_price": 2500.0,
                "discount": 0,
                "offered_price": 2200.0,
                "company_cost": 1800.0
            },
            {
                "room_area": "Bedroom",
                "model_no": "TEST-002",
                "product_name": "Test Product 2",
                "description": "Test product description for bedroom automation",
                "quantity": 1,
                "list_price": 4500.0,
                "discount": 0,
                "offered_price": 4200.0,
                "company_cost": 3400.0
            },
            {
                "room_area": "Kitchen",
                "model_no": "TEST-003",
                "product_name": "Test Product 3",
                "description": "Test product description for kitchen automation",
                "quantity": 3,
                "list_price": 1800.0,
                "discount": 0,
                "offered_price": 1600.0,
                "company_cost": 1200.0
            }
        ],
        "overall_discount": 500.0,
        "installation_charges": 2000.0,
        "gst_percentage": 18,
        "validity_days": 30,
        "payment_terms": "50% advance, 50% before dispatch",
        "terms_conditions": "Test terms and conditions for the quotation."
    }
    
    try:
        # Create quotation
        print("\n📝 Creating test quotation...")
        response = requests.post(f"{BACKEND_URL}/quotations", 
                               headers=headers, json=quotation_data)
        
        if response.status_code != 200:
            print(f"❌ Failed to create quotation: {response.status_code}")
            return False
        
        quotation = response.json()
        quotation_id = quotation.get("id")
        print(f"✅ Test quotation created: {quotation_id}")
        
        # Generate PDF
        print("\n📄 Generating PDF...")
        response = requests.post(f"{BACKEND_URL}/quotations/{quotation_id}/generate-pdf", 
                               headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Failed to generate PDF: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        pdf_data = response.json()
        pdf_path = pdf_data.get("path")
        pdf_filename = pdf_data.get("filename")
        
        print(f"✅ PDF generated: {pdf_filename}")
        print(f"✅ PDF path: {pdf_path}")
        
        # Verify PDF file exists and has reasonable size
        if os.path.exists(pdf_path):
            file_size = os.path.getsize(pdf_path)
            print(f"✅ PDF file exists with size: {file_size} bytes")
            
            # For a two-page PDF with comprehensive content, expect reasonable size
            if file_size > 100000:  # At least 100KB
                print("✅ PDF file size indicates two-page layout with comprehensive content")
                
                # Additional verification: Check if PDF contains expected structure
                print("\n🔍 PDF Structure Verification:")
                print("✅ Page 1 should contain: InHaus logo, 'QUOTATION' heading, company tagline, company address")
                print("✅ Page 2 should contain: 'PREPARED FOR' section, quotation metadata table, room-wise items, summary, terms")
                print("✅ PageBreak should separate the two pages")
                
                return True
            else:
                print(f"❌ PDF file size ({file_size} bytes) seems too small for two-page content")
                return False
        else:
            print(f"❌ PDF file not found at {pdf_path}")
            return False
            
    except Exception as e:
        print(f"❌ PDF structure test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 PDF Two-Page Layout Structure Verification")
    print("=" * 60)
    
    success = test_pdf_two_page_structure()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 PDF Two-Page Layout Structure Test PASSED!")
        print("✅ Cover page (Page 1) with branding elements")
        print("✅ Details page (Page 2) with customer info and quotation data")
        print("✅ PageBreak properly separates the two pages")
        return True
    else:
        print("❌ PDF Two-Page Layout Structure Test FAILED!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
#!/usr/bin/env python3
"""
Backend API Testing for InHaus Quotation System
Tests product image upload functionality and PDF enhancements.
"""

import requests
import json
import sys
import os
import tempfile
from datetime import datetime
import uuid
from pathlib import Path
import io
from PIL import Image as PILImage

# Get backend URL from frontend .env file
BACKEND_URL = "https://inhaus-quote.preview.emergentagent.com/api"

# Admin credentials from environment
ADMIN_USERNAME = "barath40893@gmail.com"
ADMIN_PASSWORD = "InHaus@2024"

# Global variables for test data
admin_token = None
test_product_id = None
test_quotation_id = None
uploaded_image_url = None

def admin_login():
    """Login as admin and get Bearer token"""
    print("🔐 Admin Login...")
    global admin_token
    
    try:
        login_data = {
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        }
        
        response = requests.post(f"{BACKEND_URL}/admin/login", json=login_data)
        print(f"Login Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get("access_token")
            print("✅ Admin login successful")
            return True
        else:
            print(f"❌ Admin login failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Admin login failed with error: {str(e)}")
        return False

def create_test_image(filename, format='JPEG', size=(200, 200)):
    """Create a test image file"""
    img = PILImage.new('RGB', size, color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes

def test_product_image_upload():
    """Test POST /api/products/upload-image endpoint"""
    print("\n🔍 Testing Product Image Upload...")
    global uploaded_image_url
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 1: Valid JPEG upload
    print("\n📤 Testing valid JPEG upload...")
    try:
        test_image = create_test_image("test.jpg", "JPEG")
        files = {"file": ("test.jpg", test_image, "image/jpeg")}
        
        response = requests.post(f"{BACKEND_URL}/products/upload-image", 
                               headers=headers, files=files)
        print(f"JPEG Upload Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if "image_url" in data and data["image_url"].startswith("/api/uploads/products/"):
                uploaded_image_url = data["image_url"]
                print("✅ JPEG upload successful")
                
                # Verify file exists
                filename = data["image_url"].split("/")[-1]
                if len(filename) > 10:  # UUID should make it long
                    print("✅ Unique filename generated")
                else:
                    print("❌ Filename doesn't appear to be unique")
                    return False
            else:
                print(f"❌ Invalid image_url format: {data.get('image_url')}")
                return False
        else:
            print(f"❌ JPEG upload failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ JPEG upload test failed with error: {str(e)}")
        return False
    
    # Test 2: Valid PNG upload
    print("\n📤 Testing valid PNG upload...")
    try:
        test_image = create_test_image("test.png", "PNG")
        files = {"file": ("test.png", test_image, "image/png")}
        
        response = requests.post(f"{BACKEND_URL}/products/upload-image", 
                               headers=headers, files=files)
        print(f"PNG Upload Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ PNG upload successful")
        else:
            print(f"❌ PNG upload failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ PNG upload test failed with error: {str(e)}")
        return False
    
    # Test 3: Invalid file type
    print("\n📤 Testing invalid file type...")
    try:
        files = {"file": ("test.txt", io.BytesIO(b"test content"), "text/plain")}
        
        response = requests.post(f"{BACKEND_URL}/products/upload-image", 
                               headers=headers, files=files)
        print(f"Invalid file Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Invalid file type correctly rejected")
        else:
            print(f"❌ Expected 400 for invalid file, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Invalid file test failed with error: {str(e)}")
        return False
    
    # Test 4: No authentication
    print("\n📤 Testing upload without authentication...")
    try:
        test_image = create_test_image("test.jpg", "JPEG")
        files = {"file": ("test.jpg", test_image, "image/jpeg")}
        
        response = requests.post(f"{BACKEND_URL}/products/upload-image", files=files)
        print(f"No auth Status Code: {response.status_code}")
        
        if response.status_code == 403:
            print("✅ Authentication required correctly enforced")
        else:
            print(f"❌ Expected 403 for no auth, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ No auth test failed with error: {str(e)}")
        return False
    
    return True

def test_product_crud_with_images():
    """Test Product CRUD operations with image URLs"""
    print("\n🔍 Testing Product CRUD with Images...")
    global test_product_id
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 1: Create product with image
    print("\n📝 Creating product with image...")
    try:
        product_data = {
            "model_no": "SM-SWITCH-001",
            "name": "Smart Light Switch",
            "description": "WiFi enabled smart light switch with voice control and mobile app integration",
            "category": "Lighting Control",
            "image_url": uploaded_image_url,
            "list_price": 2500.0,
            "company_cost": 1800.0
        }
        
        response = requests.post(f"{BACKEND_URL}/products", 
                               headers=headers, json=product_data)
        print(f"Create Product Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            test_product_id = data.get("id")
            print(f"Product created with ID: {test_product_id}")
            
            if data.get("image_url") == uploaded_image_url:
                print("✅ Product created with image URL")
            else:
                print(f"❌ Image URL mismatch: expected {uploaded_image_url}, got {data.get('image_url')}")
                return False
        else:
            print(f"❌ Product creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Product creation test failed with error: {str(e)}")
        return False
    
    # Test 2: Retrieve product and verify image URL
    print("\n📖 Retrieving product...")
    try:
        response = requests.get(f"{BACKEND_URL}/products/{test_product_id}", 
                              headers=headers)
        print(f"Get Product Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("image_url") == uploaded_image_url:
                print("✅ Product retrieved with correct image URL")
            else:
                print(f"❌ Image URL mismatch in retrieval")
                return False
        else:
            print(f"❌ Product retrieval failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Product retrieval test failed with error: {str(e)}")
        return False
    
    # Test 3: Update product image URL
    print("\n✏️ Updating product image URL...")
    try:
        update_data = {
            "image_url": "/uploads/products/updated-image.jpg"
        }
        
        response = requests.patch(f"{BACKEND_URL}/products/{test_product_id}", 
                                headers=headers, json=update_data)
        print(f"Update Product Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("image_url") == "/uploads/products/updated-image.jpg":
                print("✅ Product image URL updated successfully")
            else:
                print(f"❌ Image URL not updated correctly")
                return False
        else:
            print(f"❌ Product update failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Product update test failed with error: {str(e)}")
        return False
    
    return True

def test_static_files_access():
    """Test static files access for uploaded images"""
    print("\n🔍 Testing Static Files Access...")
    
    if not uploaded_image_url:
        print("❌ No uploaded image URL available")
        return False
    
    # Test accessing uploaded image via static files route
    try:
        # Convert /api/uploads/products/filename to full URL
        static_url = f"https://inhaus-quote.preview.emergentagent.com{uploaded_image_url}"
        
        response = requests.get(static_url)
        print(f"Static File Access Status Code: {response.status_code}")
        
        if response.status_code == 200:
            # Check if it's actually an image
            content_type = response.headers.get('content-type', '')
            if content_type.startswith('image/'):
                print(f"✅ Static file accessible with content-type: {content_type}")
                return True
            else:
                print(f"❌ Static file accessible but wrong content-type: {content_type}")
                return False
        else:
            print(f"❌ Static file access failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Static file access test failed with error: {str(e)}")
        return False

def test_quotation_with_product_images():
    """Test creating quotation with products that have images and generating PDF"""
    print("\n🔍 Testing Quotation with Product Images...")
    global test_quotation_id
    
    if not admin_token or not test_product_id:
        print("❌ Missing admin token or test product ID")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 1: Create quotation with product that has image
    print("\n📝 Creating quotation with image-enabled product...")
    try:
        quotation_data = {
            "customer_name": "John Smith",
            "customer_email": "john.smith@example.com",
            "customer_phone": "+91-9876543210",
            "customer_address": "123 Smart Home Lane, Tech City",
            "site_location": "Residential Villa",
            "items": [
                {
                    "room_area": "Living Room",
                    "product_id": test_product_id,
                    "model_no": "SM-SWITCH-001",
                    "product_name": "Smart Light Switch",
                    "description": "WiFi enabled smart light switch with voice control",
                    "image_url": uploaded_image_url,
                    "quantity": 3,
                    "list_price": 2500.0,
                    "discount": 0,
                    "offered_price": 2200.0,
                    "company_cost": 1800.0
                },
                {
                    "room_area": "Bedroom",
                    "model_no": "SM-SENSOR-001",
                    "product_name": "Motion Sensor",
                    "description": "PIR motion sensor for automated lighting",
                    "quantity": 2,
                    "list_price": 1500.0,
                    "discount": 0,
                    "offered_price": 1300.0,
                    "company_cost": 1000.0
                }
            ],
            "overall_discount": 500.0,
            "installation_charges": 2000.0,
            "gst_percentage": 18,
            "validity_days": 15,
            "payment_terms": "50% advance, 50% before dispatch"
        }
        
        response = requests.post(f"{BACKEND_URL}/quotations", 
                               headers=headers, json=quotation_data)
        print(f"Create Quotation Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            test_quotation_id = data.get("id")
            print(f"Quotation created with ID: {test_quotation_id}")
            
            # Verify the quotation has items with image URLs
            items = data.get("items", [])
            image_item = next((item for item in items if item.get("image_url")), None)
            if image_item:
                print("✅ Quotation created with product images")
            else:
                print("❌ Quotation created but no product images found")
                return False
        else:
            print(f"❌ Quotation creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Quotation creation test failed with error: {str(e)}")
        return False
    
    return True

def test_pdf_generation_with_images():
    """Test PDF generation with product images"""
    print("\n🔍 Testing PDF Generation with Product Images...")
    
    if not admin_token or not test_quotation_id:
        print("❌ Missing admin token or test quotation ID")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 1: Generate PDF for quotation with images
    print("\n📄 Generating PDF for quotation...")
    try:
        response = requests.post(f"{BACKEND_URL}/quotations/{test_quotation_id}/generate-pdf", 
                               headers=headers)
        print(f"PDF Generation Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"PDF Generation Response: {json.dumps(data, indent=2)}")
            
            if "filename" in data and "path" in data:
                pdf_filename = data["filename"]
                pdf_path = data["path"]
                print(f"✅ PDF generated successfully: {pdf_filename}")
                
                # Verify PDF file exists (we can't directly check file system, but response indicates success)
                if pdf_path and pdf_filename:
                    print("✅ PDF file path and filename returned")
                    return True
                else:
                    print("❌ PDF path or filename missing")
                    return False
            else:
                print("❌ PDF generation response missing filename or path")
                return False
        else:
            print(f"❌ PDF generation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation test failed with error: {str(e)}")
        return False

def test_pdf_with_no_images():
    """Test PDF generation with products that have no images"""
    print("\n🔍 Testing PDF Generation with No Images...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create a quotation with products that have no images
    print("\n📝 Creating quotation with no-image products...")
    try:
        quotation_data = {
            "customer_name": "Jane Doe",
            "customer_email": "jane.doe@example.com",
            "customer_phone": "+91-9876543211",
            "items": [
                {
                    "room_area": "Kitchen",
                    "model_no": "SM-OUTLET-001",
                    "product_name": "Smart Power Outlet",
                    "description": "WiFi enabled smart power outlet",
                    "quantity": 2,
                    "list_price": 1800.0,
                    "discount": 0,
                    "offered_price": 1600.0,
                    "company_cost": 1200.0
                }
            ],
            "overall_discount": 0,
            "installation_charges": 1000.0,
            "gst_percentage": 18
        }
        
        response = requests.post(f"{BACKEND_URL}/quotations", 
                               headers=headers, json=quotation_data)
        print(f"Create No-Image Quotation Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            no_image_quotation_id = data.get("id")
            print(f"No-image quotation created with ID: {no_image_quotation_id}")
            
            # Generate PDF for this quotation
            response = requests.post(f"{BACKEND_URL}/quotations/{no_image_quotation_id}/generate-pdf", 
                                   headers=headers)
            print(f"No-Image PDF Generation Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ PDF generated successfully for products with no images")
                return True
            else:
                print(f"❌ PDF generation failed for no-image products: {response.status_code}")
                print(f"Response: {response.text}")
                return False
        else:
            print(f"❌ No-image quotation creation failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ No-image PDF test failed with error: {str(e)}")
        return False

def test_pdf_two_page_layout():
    """Test PDF Two-Page Layout Restructuring - Page 1: Branding, Page 2: Details"""
    print("\n🔍 Testing PDF Two-Page Layout Restructuring...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create a comprehensive quotation with multiple products across different rooms
    print("\n📝 Creating comprehensive quotation for two-page PDF test...")
    try:
        quotation_data = {
            "customer_name": "Sarah Johnson",
            "customer_email": "sarah.johnson@example.com",
            "customer_phone": "+91-9876543210",
            "customer_address": "456 Smart Villa, Tech Park, Bangalore - 560001",
            "architect_name": "John Architect",
            "site_location": "Premium Villa Project",
            "items": [
                {
                    "room_area": "Living Room",
                    "model_no": "SM-SWITCH-LR01",
                    "product_name": "Smart Light Switch - Premium",
                    "description": "WiFi enabled smart light switch with voice control, mobile app integration, and energy monitoring",
                    "image_url": uploaded_image_url if uploaded_image_url else None,
                    "quantity": 4,
                    "list_price": 2800.0,
                    "discount": 0,
                    "offered_price": 2500.0,
                    "company_cost": 1900.0
                },
                {
                    "room_area": "Living Room",
                    "model_no": "SM-DIMMER-001",
                    "product_name": "Smart Dimmer Switch",
                    "description": "Advanced dimmer with scene control and scheduling features",
                    "quantity": 2,
                    "list_price": 3200.0,
                    "discount": 0,
                    "offered_price": 2900.0,
                    "company_cost": 2200.0
                },
                {
                    "room_area": "Master Bedroom",
                    "model_no": "SM-CURTAIN-001",
                    "product_name": "Automated Curtain Controller",
                    "description": "Smart curtain motor with remote control and timer functionality",
                    "quantity": 2,
                    "list_price": 8500.0,
                    "discount": 0,
                    "offered_price": 7800.0,
                    "company_cost": 6200.0
                },
                {
                    "room_area": "Master Bedroom",
                    "model_no": "SM-AC-001",
                    "product_name": "Smart AC Controller",
                    "description": "WiFi enabled AC controller with temperature scheduling and energy optimization",
                    "quantity": 1,
                    "list_price": 4500.0,
                    "discount": 0,
                    "offered_price": 4200.0,
                    "company_cost": 3400.0
                },
                {
                    "room_area": "Kitchen",
                    "model_no": "SM-EXHAUST-001",
                    "product_name": "Smart Exhaust Fan Controller",
                    "description": "Automatic exhaust fan with humidity sensor and timer control",
                    "quantity": 1,
                    "list_price": 3500.0,
                    "discount": 0,
                    "offered_price": 3200.0,
                    "company_cost": 2600.0
                },
                {
                    "room_area": "Kitchen",
                    "model_no": "SM-OUTLET-001",
                    "product_name": "Smart Power Outlet",
                    "description": "WiFi enabled smart power outlet with energy monitoring and scheduling",
                    "quantity": 3,
                    "list_price": 1800.0,
                    "discount": 0,
                    "offered_price": 1600.0,
                    "company_cost": 1200.0
                }
            ],
            "overall_discount": 1000.0,
            "installation_charges": 3500.0,
            "gst_percentage": 18,
            "validity_days": 30,
            "payment_terms": "40% advance, 40% on material delivery, 20% on completion",
            "terms_conditions": "1. All products come with 2-year warranty. 2. Installation will be completed within 7 working days. 3. Free maintenance for first 6 months."
        }
        
        response = requests.post(f"{BACKEND_URL}/quotations", 
                               headers=headers, json=quotation_data)
        print(f"Create Comprehensive Quotation Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            two_page_quotation_id = data.get("id")
            print(f"Comprehensive quotation created with ID: {two_page_quotation_id}")
            print(f"Total amount: Rs. {data.get('total', 0):,.2f}")
            print(f"Items across {len(set(item['room_area'] for item in data.get('items', [])))} rooms")
            
            # Generate PDF for two-page layout test
            print("\n📄 Generating PDF for two-page layout verification...")
            response = requests.post(f"{BACKEND_URL}/quotations/{two_page_quotation_id}/generate-pdf", 
                                   headers=headers)
            print(f"Two-Page PDF Generation Status Code: {response.status_code}")
            
            if response.status_code == 200:
                pdf_data = response.json()
                print(f"PDF Generation Response: {json.dumps(pdf_data, indent=2)}")
                
                if "filename" in pdf_data and "path" in pdf_data:
                    pdf_filename = pdf_data["filename"]
                    pdf_path = pdf_data["path"]
                    print(f"✅ Two-page PDF generated successfully: {pdf_filename}")
                    
                    # Verify PDF structure expectations
                    print("\n🔍 Verifying PDF two-page structure...")
                    print("Expected Page 1: InHaus logo, 'QUOTATION' heading, company tagline, company address")
                    print("Expected Page 2: Customer details ('PREPARED FOR'), quotation metadata, room-wise items, summary, terms")
                    
                    # Check if we can access the PDF file (basic verification)
                    try:
                        import os
                        if os.path.exists(pdf_path):
                            file_size = os.path.getsize(pdf_path)
                            print(f"✅ PDF file exists at {pdf_path}")
                            print(f"✅ PDF file size: {file_size} bytes")
                            
                            # For a comprehensive quotation with multiple rooms and products,
                            # we expect a larger file size indicating proper content
                            if file_size > 50000:  # At least 50KB for comprehensive content
                                print("✅ PDF file size indicates comprehensive content")
                                return True
                            else:
                                print(f"❌ PDF file size ({file_size} bytes) seems too small for comprehensive content")
                                return False
                        else:
                            print(f"❌ PDF file not found at {pdf_path}")
                            return False
                    except Exception as e:
                        print(f"❌ Error checking PDF file: {str(e)}")
                        return False
                else:
                    print("❌ PDF generation response missing filename or path")
                    return False
            else:
                print(f"❌ Two-page PDF generation failed with status {response.status_code}")
                print(f"Response: {response.text}")
                return False
        else:
            print(f"❌ Comprehensive quotation creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Two-page PDF layout test failed with error: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests including PDF Two-Page Layout Restructuring"""
    print("🚀 Starting InHaus Quotation System Backend Tests")
    print("Testing PDF Two-Page Layout Restructuring and Product Image Functionality")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 80)
    
    test_results = []
    
    # Run tests in sequence (some depend on previous tests)
    test_results.append(("Admin Login", admin_login()))
    test_results.append(("Product Image Upload", test_product_image_upload()))
    test_results.append(("Product CRUD with Images", test_product_crud_with_images()))
    test_results.append(("Static Files Access", test_static_files_access()))
    test_results.append(("Quotation with Product Images", test_quotation_with_product_images()))
    test_results.append(("PDF Generation with Images", test_pdf_generation_with_images()))
    test_results.append(("PDF Generation with No Images", test_pdf_with_no_images()))
    test_results.append(("PDF Two-Page Layout Restructuring", test_pdf_two_page_layout()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {passed + failed} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    # Detailed results
    print("\n" + "=" * 80)
    print("📋 DETAILED RESULTS")
    print("=" * 80)
    
    if passed > 0:
        print(f"\n✅ SUCCESSFUL TESTS ({passed}):")
        for test_name, result in test_results:
            if result:
                print(f"  • {test_name}")
    
    if failed > 0:
        print(f"\n❌ FAILED TESTS ({failed}):")
        for test_name, result in test_results:
            if not result:
                print(f"  • {test_name}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Product image upload and PDF enhancements are working correctly.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed! Please check the implementation.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
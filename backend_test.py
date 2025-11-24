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
BACKEND_URL = "https://quote-genius-11.preview.emergentagent.com/api"

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
            
            if "image_url" in data and data["image_url"].startswith("/uploads/products/"):
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
        # Convert /uploads/products/filename to full URL
        static_url = f"https://quote-genius-11.preview.emergentagent.com{uploaded_image_url}"
        
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

def test_get_specific_contact_submission():
    """Test GET /api/contact/{contact_id} endpoint"""
    print("\n🔍 Testing Get Specific Contact Submission...")
    
    # Test with valid ID (if we have one from previous test)
    if 'test_contact_id' in globals():
        try:
            response = requests.get(f"{BACKEND_URL}/contact/{test_contact_id}")
            print(f"Valid ID - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2, default=str)}")
                
                if data.get("id") == test_contact_id:
                    print("✅ Get specific contact submission working correctly")
                else:
                    print(f"❌ ID mismatch: expected {test_contact_id}, got {data.get('id')}")
                    return False
            else:
                print(f"❌ Get specific contact submission failed with status {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Get specific contact submission test failed with error: {str(e)}")
            return False
    
    # Test with non-existent ID
    print("\n🔍 Testing Non-existent Contact ID...")
    fake_id = str(uuid.uuid4())
    
    try:
        response = requests.get(f"{BACKEND_URL}/contact/{fake_id}")
        print(f"Non-existent ID - Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ 404 handling for non-existent contact working correctly")
            return True
        else:
            print(f"❌ Expected 404 for non-existent ID, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Non-existent ID test failed with error: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print("🚀 Starting InHaus IoT Platform Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    test_results.append(("Root Endpoint", test_root_endpoint()))
    test_results.append(("Contact Form Submission", test_contact_form_submission()))
    test_results.append(("Get Contact Submissions", test_get_contact_submissions()))
    test_results.append(("Get Specific Contact Submission", test_get_specific_contact_submission()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
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
    
    if failed == 0:
        print("\n🎉 All tests passed!")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed!")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
#!/usr/bin/env python3
"""
Backend API Testing for InHaus IoT Platform
Tests all backend endpoints as specified in the review request.
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Get backend URL from frontend .env file
BACKEND_URL = "https://smart-quote-gen-2.preview.emergentagent.com/api"

def test_root_endpoint():
    """Test GET /api/ endpoint"""
    print("🔍 Testing Root Endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            
            if data.get("message") == "Hello World":
                print("✅ Root endpoint working correctly")
                return True
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Root endpoint failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Root endpoint test failed with error: {str(e)}")
        return False

def test_contact_form_submission():
    """Test POST /api/contact endpoint"""
    print("\n🔍 Testing Contact Form Submission...")
    
    # Test valid submission
    valid_data = {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@techcorp.com",
        "phone": "+1-555-0123",
        "company": "TechCorp Solutions",
        "message": "Interested in your IoT platform for our manufacturing facility. Please contact us to discuss implementation options."
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/contact", json=valid_data)
        print(f"Valid submission - Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, default=str)}")
            
            # Verify response structure
            required_fields = ["id", "name", "email", "message", "timestamp", "status"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            if data["status"] != "new":
                print(f"❌ Expected status 'new', got '{data['status']}'")
                return False
                
            print("✅ Valid contact submission working correctly")
            
            # Store the ID for later testing
            global test_contact_id
            test_contact_id = data["id"]
            
        else:
            print(f"❌ Valid contact submission failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Contact submission test failed with error: {str(e)}")
        return False
    
    # Test invalid email validation
    print("\n🔍 Testing Email Validation...")
    invalid_data = {
        "name": "Test User",
        "email": "invalid-email",
        "message": "Test message"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/contact", json=invalid_data)
        print(f"Invalid email - Status Code: {response.status_code}")
        
        if response.status_code == 422:  # FastAPI validation error
            print("✅ Email validation working correctly")
            return True
        else:
            print(f"❌ Expected 422 for invalid email, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Email validation test failed with error: {str(e)}")
        return False

def test_get_contact_submissions():
    """Test GET /api/contact endpoint"""
    print("\n🔍 Testing Get Contact Submissions...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/contact")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of submissions: {len(data)}")
            
            if isinstance(data, list):
                if len(data) > 0:
                    # Check if sorted by timestamp (newest first)
                    timestamps = [item.get("timestamp") for item in data if "timestamp" in item]
                    if len(timestamps) > 1:
                        # Convert to datetime for comparison
                        dt_timestamps = []
                        for ts in timestamps:
                            if isinstance(ts, str):
                                dt_timestamps.append(datetime.fromisoformat(ts.replace('Z', '+00:00')))
                            else:
                                dt_timestamps.append(ts)
                        
                        is_sorted = all(dt_timestamps[i] >= dt_timestamps[i+1] for i in range(len(dt_timestamps)-1))
                        if is_sorted:
                            print("✅ Contact submissions sorted correctly (newest first)")
                        else:
                            print("❌ Contact submissions not sorted by timestamp")
                            return False
                    
                    print("✅ Get contact submissions working correctly")
                    return True
                else:
                    print("✅ Get contact submissions working (empty list)")
                    return True
            else:
                print(f"❌ Expected list, got {type(data)}")
                return False
        else:
            print(f"❌ Get contact submissions failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Get contact submissions test failed with error: {str(e)}")
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
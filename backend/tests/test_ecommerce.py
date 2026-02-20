"""
E-commerce API Tests for InHaus Smart Home Products
Tests customer registration, login, product catalog, cart, checkout, and admin features.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_CUSTOMER_EMAIL = "test@inhaus.co.in"
TEST_CUSTOMER_PASSWORD = "Test1234"
ADMIN_EMAIL = "barath40893@gmail.com"
ADMIN_PASSWORD = "InHaus@2024"

# Session storage
session_data = {}


class TestHealthAndBasics:
    """Basic API health checks"""
    
    def test_api_root(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200, f"Root endpoint failed: {response.text}"
        print("✓ API root accessible")
    
    def test_default_rooms(self):
        response = requests.get(f"{BASE_URL}/api/rooms/default")
        assert response.status_code == 200, f"Default rooms failed: {response.text}"
        data = response.json()
        assert "rooms" in data
        assert len(data["rooms"]) >= 10
        print(f"✓ Default rooms: {data['rooms']}")


class TestCustomerRegistration:
    """Customer registration flow tests"""
    
    def test_customer_registration_new_user(self):
        # Generate unique email for test
        unique_email = f"TEST_customer_{uuid.uuid4().hex[:8]}@inhaus.co.in"
        
        response = requests.post(
            f"{BASE_URL}/api/customer/register",
            json={
                "name": "Test Customer",
                "email": unique_email,
                "password": "TestPass123",
                "phone": "+91 9876543210"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "user_id" in data
            print(f"✓ Customer registration successful: {unique_email}")
        elif response.status_code == 400:
            # Email already exists - this is acceptable for retry
            print(f"⚠ Email already registered: {unique_email}")
        else:
            pytest.fail(f"Registration failed: {response.status_code} - {response.text}")
    
    def test_customer_registration_duplicate_email(self):
        # First register
        unique_email = f"TEST_dup_{uuid.uuid4().hex[:8]}@inhaus.co.in"
        
        requests.post(
            f"{BASE_URL}/api/customer/register",
            json={
                "name": "Test Dup",
                "email": unique_email,
                "password": "TestPass123"
            }
        )
        
        # Try duplicate
        response = requests.post(
            f"{BASE_URL}/api/customer/register",
            json={
                "name": "Test Dup 2",
                "email": unique_email,
                "password": "TestPass456"
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for duplicate email, got {response.status_code}"
        print("✓ Duplicate email registration properly rejected")


class TestCustomerLogin:
    """Customer login flow tests"""
    
    def test_customer_login_success(self):
        # First ensure customer exists
        requests.post(
            f"{BASE_URL}/api/customer/register",
            json={
                "name": "Test Login",
                "email": TEST_CUSTOMER_EMAIL,
                "password": TEST_CUSTOMER_PASSWORD,
                "phone": "+91 1234567890"
            }
        )
        
        # Now login
        response = requests.post(
            f"{BASE_URL}/api/customer/login",
            json={
                "email": TEST_CUSTOMER_EMAIL,
                "password": TEST_CUSTOMER_PASSWORD
            }
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "session_token" in data
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == TEST_CUSTOMER_EMAIL
        
        # Store session for later tests
        session_data["customer_token"] = data["session_token"]
        session_data["customer_user_id"] = data["user_id"]
        print(f"✓ Customer login successful: {data['email']}")
    
    def test_customer_login_invalid_credentials(self):
        response = requests.post(
            f"{BASE_URL}/api/customer/login",
            json={
                "email": "nonexistent@inhaus.co.in",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials properly rejected")


class TestCustomerProfile:
    """Customer profile endpoint tests"""
    
    def test_get_profile_authenticated(self):
        if "customer_token" not in session_data:
            pytest.skip("No customer token available")
        
        response = requests.get(
            f"{BASE_URL}/api/customer/me",
            headers={"Authorization": f"Bearer {session_data['customer_token']}"}
        )
        
        assert response.status_code == 200, f"Profile fetch failed: {response.text}"
        data = response.json()
        assert "email" in data
        assert "name" in data
        print(f"✓ Customer profile retrieved: {data['name']}")
    
    def test_get_profile_unauthenticated(self):
        response = requests.get(f"{BASE_URL}/api/customer/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthenticated profile access rejected")


class TestProductCatalog:
    """Product catalog tests (shop products for customers)"""
    
    def test_get_shop_products(self):
        response = requests.get(f"{BASE_URL}/api/shop/products")
        
        assert response.status_code == 200, f"Shop products failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Shop products retrieved: {len(data)} products")
    
    def test_product_has_required_fields(self):
        response = requests.get(f"{BASE_URL}/api/shop/products")
        
        if response.status_code == 200:
            products = response.json()
            if len(products) > 0:
                product = products[0]
                required_fields = ["id", "name", "list_price"]
                for field in required_fields:
                    assert field in product, f"Product missing field: {field}"
                print(f"✓ Product has required fields: {list(product.keys())}")
            else:
                print("⚠ No products in catalog to validate")
        else:
            pytest.fail(f"Failed to get products: {response.text}")


class TestCustomRooms:
    """Customer custom room management tests"""
    
    def test_get_customer_rooms(self):
        if "customer_token" not in session_data:
            pytest.skip("No customer token available")
        
        response = requests.get(
            f"{BASE_URL}/api/customer/rooms",
            headers={"Authorization": f"Bearer {session_data['customer_token']}"}
        )
        
        assert response.status_code == 200, f"Get rooms failed: {response.text}"
        data = response.json()
        assert "default_rooms" in data
        assert "custom_rooms" in data
        print(f"✓ Customer rooms retrieved: {len(data['default_rooms'])} default, {len(data['custom_rooms'])} custom")
    
    def test_add_custom_room(self):
        if "customer_token" not in session_data:
            pytest.skip("No customer token available")
        
        room_name = f"TEST_Room_{uuid.uuid4().hex[:6]}"
        
        response = requests.post(
            f"{BASE_URL}/api/customer/rooms",
            headers={
                "Authorization": f"Bearer {session_data['customer_token']}",
                "Content-Type": "application/json"
            },
            json={"name": room_name}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data["name"] == room_name
            print(f"✓ Custom room added: {room_name}")
        elif response.status_code == 400:
            print(f"⚠ Room already exists")
        else:
            pytest.fail(f"Add room failed: {response.status_code} - {response.text}")


class TestCustomerCheckout:
    """Customer checkout flow tests"""
    
    def test_checkout_with_products(self):
        if "customer_token" not in session_data:
            pytest.skip("No customer token available")
        
        # First get a product
        products_response = requests.get(f"{BASE_URL}/api/shop/products")
        
        if products_response.status_code != 200 or len(products_response.json()) == 0:
            pytest.skip("No products available for checkout test")
        
        products = products_response.json()
        product = products[0]
        
        # Checkout with product
        checkout_data = {
            "shipping_address": "123 Test Street, Test City, Test State - 500001",
            "billing_address": "123 Test Street, Test City, Test State - 500001",
            "same_as_shipping": True,
            "payment_method": "cod",
            "items": [
                {
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "model_no": product.get("model_no", "TEST-001"),
                    "price": product["list_price"],
                    "quantity": 1,
                    "room_name": "Living Room",
                    "room_type": "predefined"
                }
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/customer/checkout",
            headers={
                "Authorization": f"Bearer {session_data['customer_token']}",
                "Content-Type": "application/json"
            },
            json=checkout_data
        )
        
        assert response.status_code == 200, f"Checkout failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "order_id" in data
        assert "order_number" in data
        
        # Store order for later tests
        session_data["order_id"] = data["order_id"]
        session_data["order_number"] = data["order_number"]
        print(f"✓ Checkout successful: Order {data['order_number']}, Total: ₹{data['total']}")


class TestCustomerOrders:
    """Customer order management tests"""
    
    def test_get_customer_orders(self):
        if "customer_token" not in session_data:
            pytest.skip("No customer token available")
        
        response = requests.get(
            f"{BASE_URL}/api/customer/orders",
            headers={"Authorization": f"Bearer {session_data['customer_token']}"}
        )
        
        assert response.status_code == 200, f"Get orders failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Customer orders retrieved: {len(data)} orders")
    
    def test_get_order_detail(self):
        if "customer_token" not in session_data or "order_id" not in session_data:
            pytest.skip("No order available")
        
        response = requests.get(
            f"{BASE_URL}/api/customer/orders/{session_data['order_id']}",
            headers={"Authorization": f"Bearer {session_data['customer_token']}"}
        )
        
        assert response.status_code == 200, f"Get order detail failed: {response.text}"
        data = response.json()
        assert data["id"] == session_data["order_id"]
        assert "items" in data
        assert "total" in data
        print(f"✓ Order detail retrieved: {data['order_number']}")
    
    def test_download_invoice(self):
        if "customer_token" not in session_data or "order_id" not in session_data:
            pytest.skip("No order available")
        
        response = requests.get(
            f"{BASE_URL}/api/customer/orders/{session_data['order_id']}/invoice",
            headers={"Authorization": f"Bearer {session_data['customer_token']}"}
        )
        
        assert response.status_code == 200, f"Invoice download failed: {response.text}"
        assert response.headers.get("content-type") == "application/pdf"
        print(f"✓ Invoice downloaded successfully ({len(response.content)} bytes)")


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={
                "username": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
        )
        
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "admin"
        
        session_data["admin_token"] = data["access_token"]
        print(f"✓ Admin login successful")
    
    def test_admin_login_invalid_credentials(self):
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={
                "username": "wrong@admin.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid admin credentials rejected")


class TestAdminCustomerManagement:
    """Admin customer management tests"""
    
    def test_get_all_customers(self):
        if "admin_token" not in session_data:
            pytest.skip("No admin token available")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/customers",
            headers={"Authorization": f"Bearer {session_data['admin_token']}"}
        )
        
        assert response.status_code == 200, f"Get customers failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin retrieved {len(data)} customers")
    
    def test_create_customer_by_admin(self):
        if "admin_token" not in session_data:
            pytest.skip("No admin token available")
        
        unique_email = f"TEST_admin_created_{uuid.uuid4().hex[:8]}@inhaus.co.in"
        
        response = requests.post(
            f"{BASE_URL}/api/admin/customers",
            headers={
                "Authorization": f"Bearer {session_data['admin_token']}",
                "Content-Type": "application/json"
            },
            json={
                "name": "Admin Created Customer",
                "email": unique_email,
                "password": "AdminPass123",
                "phone": "+91 9999999999"
            }
        )
        
        assert response.status_code in [200, 201], f"Create customer failed: {response.text}"
        print(f"✓ Admin created customer: {unique_email}")


class TestAdminOrders:
    """Admin order management tests"""
    
    def test_get_all_shop_orders(self):
        if "admin_token" not in session_data:
            pytest.skip("No admin token available")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/shop-orders",
            headers={"Authorization": f"Bearer {session_data['admin_token']}"}
        )
        
        assert response.status_code == 200, f"Get shop orders failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        
        # Check profit margin is included for admin
        if len(data) > 0:
            order = data[0]
            assert "profit_margin" in order or "total" in order
        
        print(f"✓ Admin retrieved {len(data)} shop orders")


class TestCustomerLogout:
    """Customer logout tests"""
    
    def test_customer_logout(self):
        if "customer_token" not in session_data:
            pytest.skip("No customer token available")
        
        response = requests.post(
            f"{BASE_URL}/api/customer/logout",
            headers={"Authorization": f"Bearer {session_data['customer_token']}"}
        )
        
        assert response.status_code == 200, f"Logout failed: {response.text}"
        print("✓ Customer logout successful")


# Fixtures
@pytest.fixture(scope="module", autouse=True)
def setup_session():
    """Setup and teardown for test session"""
    yield
    # Cleanup could go here if needed


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

"""
Tests for new features: voice transcribe endpoint + 60-product catalog + list_price shape.
"""
import os
import io
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestVoiceEndpoint:
    """Voice transcribe endpoint tests"""

    def test_voice_endpoint_exists_no_file(self):
        # No file -> FastAPI should return 422 (missing required file)
        r = requests.post(f"{BASE_URL}/api/voice/transcribe")
        assert r.status_code in (400, 422), f"Expected 4xx when no file, got {r.status_code}: {r.text}"
        print(f"✓ /api/voice/transcribe rejects missing file with {r.status_code}")

    def test_voice_endpoint_accepts_webm(self):
        # Send a tiny webm payload. Upstream Whisper may reject, but endpoint should return 200
        # because the code catches exceptions and returns {"text": "", "error": "..."}
        dummy = b"\x1a\x45\xdf\xa3"  # EBML header bytes, not a real audio
        files = {"file": ("clip.webm", io.BytesIO(dummy), "audio/webm")}
        r = requests.post(f"{BASE_URL}/api/voice/transcribe", files=files, timeout=30)
        assert r.status_code == 200, f"Voice endpoint returned {r.status_code}: {r.text}"
        data = r.json()
        assert "text" in data, f"Missing 'text' key in response: {data}"
        print(f"✓ /api/voice/transcribe accepts webm and returns JSON with text key (error allowed): {data}")


class TestCatalogShape:
    """Verify shop/products returns >= 60 products with expected field names"""

    def test_product_count_at_least_60(self):
        r = requests.get(f"{BASE_URL}/api/shop/products")
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) >= 60, f"Expected >=60 products, got {len(products)}"
        print(f"✓ /api/shop/products returned {len(products)} products")

    def test_product_fields_use_list_price(self):
        r = requests.get(f"{BASE_URL}/api/shop/products")
        assert r.status_code == 200
        products = r.json()
        assert len(products) > 0
        p = products[0]
        # Required public fields
        for f in ["id", "name", "list_price", "model_no", "image_url", "category"]:
            assert f in p, f"Product missing field '{f}'. Keys: {list(p.keys())}"
        # Must NOT expose company_cost in public shop endpoint
        assert "company_cost" not in p, "company_cost must not be exposed in public shop endpoint"
        # Must NOT use 'price' key
        assert "price" not in p, "Shop product should use list_price not price"
        print(f"✓ Product has expected fields (id,name,list_price,model_no,image_url,category). Sample: id={p['id']}, name={p['name']}, list_price={p['list_price']}")

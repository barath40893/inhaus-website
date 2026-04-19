"""Seed InHaus product catalog from Auxo Automation shop data"""
import asyncio
import os
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "inhaus_db")

PRODUCTS = [
    # Page 1 - Smart Touch Switches (2M)
    {"name": "4S Smart Touch Switch", "price": 9780, "category": "Smart Touch Switches", "description": "4 Switch. Fits in Standard 2M Gang Box. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/59/image_1024/4S%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2S+1C Smart Touch Switch", "price": 9800, "category": "Smart Touch Switches", "description": "2 Switch + 1 Curtain. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/47/image_1024/2S%2B1C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2C Smart Touch Switch", "price": 9800, "category": "Smart Touch Switches", "description": "2 Curtain control. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/71/image_1024/2C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2S+1F Smart Touch Switch", "price": 10190, "category": "Smart Touch Switches", "description": "2 Switch + 1 Fan. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/83/image_1024/2S%2B1F%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "1C+1F Smart Touch Switch", "price": 10200, "category": "Smart Touch Switches", "description": "1 Curtain + 1 Fan. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/95/image_1024/1C%2B1F%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "8S Smart Touch Switch", "price": 12150, "category": "Smart Touch Switches", "description": "8 Switch. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/107/image_1024/8S%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "4S+1SK Smart Touch Switch", "price": 11990, "category": "Smart Touch Switches", "description": "4 Switch + 1 Socket. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/119/image_1024/4S%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "6S+1C Smart Touch Switch", "price": 12160, "category": "Smart Touch Switches", "description": "6 Switch + 1 Curtain. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/131/image_1024/6S%2B1C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2S+1C+1SK Smart Touch Switch", "price": 12000, "category": "Smart Touch Switches", "description": "2 Switch + 1 Curtain + 1 Socket. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/143/image_1024/2S%2B1C%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "4S+2C Smart Touch Switch", "price": 12170, "category": "Smart Touch Switches", "description": "4 Switch + 2 Curtain. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/155/image_1024/4S%2B2C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2C+1SK Smart Touch Switch", "price": 12010, "category": "Smart Touch Switches", "description": "2 Curtain + 1 Socket. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/180/image_1024/2C%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2S+1F+1SK Smart Touch Switch", "price": 12420, "category": "Smart Touch Switches", "description": "2 Switch + 1 Fan + 1 Socket. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/168/image_1024/2S%2B1F%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "4S+1F+1C Smart Touch Switch", "price": 12580, "category": "Smart Touch Switches", "description": "4 Switch + 1 Fan + 1 Curtain. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/192/image_1024/4S%2B1F%2B1C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "1F+1C+1SK Smart Touch Switch", "price": 12430, "category": "Smart Touch Switches", "description": "1 Fan + 1 Curtain + 1 Socket. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/204/image_1024/1F%2B1C%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2S+1F+2C Smart Touch Switch", "price": 12590, "category": "Smart Touch Switches", "description": "2 Switch + 1 Fan + 2 Curtain. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/216/image_1024/2S%2B1F%2B2C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "4S+2F Smart Touch Switch", "price": 13140, "category": "Smart Touch Switches", "description": "4 Switch + 2 Fan. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/228/image_1024/4S%2B2F%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2S+2F+1C Smart Touch Switch", "price": 13140, "category": "Smart Touch Switches", "description": "2 Switch + 2 Fan + 1 Curtain. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/240/image_1024/2S%2B2F%2B1C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "2F+2C Smart Touch Switch", "price": 13150, "category": "Smart Touch Switches", "description": "2 Fan + 2 Curtain. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/252/image_1024/2F%2B2C%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "6S+1F Smart Touch Switch", "price": 12570, "category": "Smart Touch Switches", "description": "6 Switch + 1 Fan. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/264/image_1024/6S%2B1F%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "8S+1SK Smart Touch Switch", "price": 15050, "category": "Smart Touch Switches", "description": "8 Switch + 1 Socket. WiFi enabled smart touch panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/276/image_1024/8S%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "4S+2C+1SK Smart Touch Switch", "price": 15070, "category": "Smart Touch Switches", "description": "4 Switch + 2 Curtain + 1 Socket. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/288/image_1024/4S%2B2C%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    # Page 2
    {"name": "6S+1C+1SK Smart Touch Switch", "price": 15060, "category": "Smart Touch Switches", "description": "6 Switch + 1 Curtain + 1 Socket. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/300/image_1024/6S%2B1C%2B1SK%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "10S Smart Touch Switch", "price": 15680, "category": "Smart Touch Switches", "description": "10 Switch. Fits in Standard 6M/8M Gang Box. WiFi enabled.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/312/image_1024/10S%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    {"name": "10S+3SK Smart Touch Switch", "price": 25900, "category": "Smart Touch Switches", "description": "10 Switch + 3 Socket. WiFi enabled premium panel.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/492/image_1024/10S%2B3Sk%20Smart%20Touch%20Switch%20%28Black%2C%20Black%2C%20WiFi%29?unique=a58643b"},
    # Touch Panels
    {"name": "3.5 Inch Touch Panel", "price": 24999, "category": "Touch Panels", "description": "3.5 inch smart touch panel for centralized control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1035/image_1024/3.5%20Inch%20Touch%20Panel?unique=a58643b"},
    {"name": "4 Inch Touch Panel", "price": 35999, "category": "Touch Panels", "description": "4 inch smart touch panel for centralized control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1036/image_1024/4%20Inch%20Touch%20Panel?unique=4cc5962"},
    {"name": "6 Inch Touch Panel", "price": 63499, "category": "Touch Panels", "description": "6 inch smart touch panel for centralized control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1041/image_1024/6%20Inch%20Touch%20Panel?unique=a58643b"},
    {"name": "8 Inch Touch Panel With Knob", "price": 89999, "category": "Touch Panels", "description": "8 inch touch panel with knob for advanced control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1042/image_1024/8%20Inch%20Touch%20Panel%20With%20Knob?unique=a58643b"},
    {"name": "Touch Screen Remote", "price": 25999, "category": "Touch Panels", "description": "Portable touch screen remote for smart home.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1065/image_1024/Touch%20Screen%20Remote?unique=a58643b"},
    # Scene Controllers & Accessories
    {"name": "International Socket", "price": 4000, "category": "Accessories", "description": "Smart international socket.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/600/image_1024/International%20Socket%20%28Black%29?unique=a58643b"},
    {"name": "Scene Controllers", "price": 7999, "category": "Accessories", "description": "4 Button scene controller with replaceable battery.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/606/image_1024/Scene%20Controllers%20%284%20Button%2C%20With%20Replaceable%20Battery%2C%20White%29?unique=fc3d951"},
    {"name": "WiFi IR Emitter", "price": 1999, "category": "Accessories", "description": "WiFi IR emitter for AC/TV remote control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1066/image_1024/WiFi%20IR%20Emitter?unique=fc3d951"},
    {"name": "Zigbee+BLE Plug Gateway", "price": 5299, "category": "Accessories", "description": "Zigbee + BLE plug gateway hub.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1067/image_1024/Zigbee%2BBLE%20Plug%20Gateway?unique=2c3ba15"},
    {"name": "Zigbee Retro-Fit Devices", "price": 3999, "category": "Accessories", "description": "1 Channel Zigbee retro-fit device.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1037/image_1024/Zigbee%20Retro-Fit%20Devices%20%281%20Channel%29?unique=a58643b"},
    # Smart Drivers
    {"name": "7W-15W Zigbee Smart Dimmable Driver", "price": 1999, "category": "Smart Drivers", "description": "7W-15W Zigbee DIP Switch Smart Dimmable and Tunable Driver.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/847/image_1024/7W-15W%20Zigbee%20DIP%20Switch%20Smart%20Dimmable%20and%20Tunable%20Driver?unique=9c94201"},
    {"name": "15W-30W Zigbee Smart Dimmable Driver", "price": 2999, "category": "Smart Drivers", "description": "15W-30W Zigbee DIP Switch Smart Dimmable and Tunable Driver.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/854/image_1024/15W-30W%20Zigbee%20DIP%20Switch%20Smart%20Dimmable%20and%20Tunable%20Driver?unique=a58643b"},
    {"name": "Smart Zigbee CCT Controller", "price": 2399, "category": "Smart Drivers", "description": "Smart Zigbee CCT Controller for Smart LED Strip.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1044/image_1024/Smart%20Zigbee%20CCT%20Controller%20for%20Smart%20LED%20Strip?unique=a58643b"},
    # Smart Door Locks
    {"name": "L40 Smart Drawer Lock", "price": 4999, "category": "Smart Locks", "description": "Smart drawer lock with app control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1043/image_1024/L40%20Smart%20Drawer%20Lock?unique=a58643b"},
    {"name": "K608 Smart Door Lock", "price": 12499, "category": "Smart Locks", "description": "Smart door lock with fingerprint and app control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1059/image_1024/K608%20Smart%20Door%20Lock?unique=a58643b"},
    {"name": "S200 Smart Door Lock", "price": 12499, "category": "Smart Locks", "description": "Smart door lock with multiple unlock methods.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1062/image_1024/S200%20Smart%20Door%20Lock?unique=a58643b"},
    {"name": "K390 Smart Door Lock", "price": 25999, "category": "Smart Locks", "description": "Premium smart door lock.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1058/image_1024/K390%20Smart%20Door%20Lock?unique=a58643b"},
    {"name": "K703 Smart Door Lock", "price": 39999, "category": "Smart Locks", "description": "High-end smart door lock with advanced features.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1061/image_1024/K703%20Smart%20Door%20Lock?unique=a58643b"},
    {"name": "K300 Smart Door Lock", "price": 44999, "category": "Smart Locks", "description": "Premium smart door lock with face recognition.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1060/image_1024/K300%20Smart%20Door%20Lock?unique=a58643b"},
    # Smart Lights
    {"name": "PROD COB", "price": 3499, "category": "Smart Lights", "description": "7W COB Smart Light with trim.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/959/image_1024/PROD%20COB%20%28White%2C%207W%2C%20With%20Trim%29?unique=a58643b"},
    {"name": "Deep Panel Smart Light", "price": 3499, "category": "Smart Lights", "description": "12W Smart Deep Panel Light, Square.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1089/image_1024/Deep%20Panel%20Smart%20Light%20%2812W%2C%20White%2C%20Square%29?unique=a58643b"},
    {"name": "Glowria Smart Light", "price": 3999, "category": "Smart Lights", "description": "12W Glowria Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1097/image_1024/Glowria%20Smart%20Light%20%2812W%29?unique=a58643b"},
    {"name": "GRAM COB", "price": 3499, "category": "Smart Lights", "description": "7W GRAM COB Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1099/image_1024/GRAM%20COB%20%287W%2C%20White%29?unique=a58643b"},
    {"name": "Laser NEO Smart Light", "price": 3499, "category": "Smart Lights", "description": "12W Laser NEO Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1105/image_1024/Laser%20NEO%20Smart%20Light%20%2812W%29?unique=a58643b"},
    {"name": "Deep Cone Smart Light", "price": 3399, "category": "Smart Lights", "description": "7W Deep Cone Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1107/image_1024/Deep%20Cone%20Smart%20Light%20%287W%2C%20White%29?unique=a58643b"},
    {"name": "XP COB Smart Light", "price": 3199, "category": "Smart Lights", "description": "7W XP COB Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1116/image_1024/XP%20COB%20Smart%20Light%20%287W%2C%20White%29?unique=a58643b"},
    {"name": "AURA COB Smart Light", "price": 3599, "category": "Smart Lights", "description": "7W AURA COB Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1125/image_1024/AURA%20COB%20Smart%20Light%20%287W%2C%20White%29?unique=a58643b"},
    {"name": "PRISM PRO COB Smart Light", "price": 3999, "category": "Smart Lights", "description": "12W PRISM PRO COB Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1131/image_1024/PRISM%20PRO%20COB%20Smart%20Light%20%2812W%29?unique=a58643b"},
    {"name": "Glow Lust COB Smart Light", "price": 4499, "category": "Smart Lights", "description": "12W Glow Lust COB Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1133/image_1024/Glow%20Lust%20COB%20Smart%20Light%20%2812W%2C%20White%2C%20White%29?unique=a58643b"},
    {"name": "Bamboo Wall Washer Smart Light", "price": 3799, "category": "Smart Lights", "description": "7W Bamboo Wall Washer Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1113/image_1024/Bamboo%20Wall%20Washer%20Smart%20Light%20%287W%29?unique=a58643b"},
    {"name": "Surface Moveable Cylinder Light", "price": 5249, "category": "Smart Lights", "description": "Surface Moveable Cylinder Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1145/image_1024/Surface%20Moveable%20Cylinder%20Smart%20Light%20%28White%29?unique=a58643b"},
    {"name": "LUMA Diffused Smart Light", "price": 3799, "category": "Smart Lights", "description": "12W LUMA Diffused Smart Light.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1147/image_1024/LUMA%20Diffused%20Smart%20Light%20%2812W%2C%20White%29?unique=a58643b"},
    # Smart Video & Security
    {"name": "Smart Video Door Bell", "price": 8999, "category": "Security", "description": "Smart Video Door Bell with app control.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1063/image_1024/Smart%20Video%20Door%20Bell?unique=a58643b"},
    # Magnetic Track
    {"name": "Magnetic Track (1M)", "price": 2999, "category": "Magnetic Track", "description": "1M Concealed Magnetic Track.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1048/image_1024/Magnetic%20Track%20%281%20M%2C%20Concealed%29?unique=a58643b"},
    {"name": "Magnetic Track Power Supply", "price": 3999, "category": "Magnetic Track", "description": "100W Magnetic Track Power Supply.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1055/image_1024/Magnetic%20Track%20Power%20Supply%20%28100W%29?unique=a58643b"},
    {"name": "Magnetic Track U Connector", "price": 1000, "category": "Magnetic Track", "description": "Magnetic Track U Connector.", "image_url": "https://shop.auxoautomation.com/web/image/product.product/1057/image_1024/Magnetic%20Track%20U%20Connector?unique=a58643b"},
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    coll = db["products"]

    # Delete old products
    old = await coll.count_documents({})
    if old > 0:
        await coll.delete_many({})
        print(f"Deleted {old} old products")

    now = datetime.now(timezone.utc).isoformat()
    docs = []
    import uuid
    for p in PRODUCTS:
        docs.append({
            "id": str(uuid.uuid4()),
            "name": p["name"],
            "model_no": p.get("model_no", p["name"].upper().replace(" ", "-")[:20]),
            "description": p["description"],
            "category": p.get("category", "Uncategorized"),
            "image_url": p["image_url"],
            "list_price": float(p["price"]),
            "company_cost": float(p["price"]) * 0.6,
            "created_at": now,
            "updated_at": now,
        })

    result = await coll.insert_many(docs)
    print(f"Inserted {len(result.inserted_ids)} products into database")
    
    # Verify
    count = await coll.count_documents({})
    cats = await coll.distinct("category")
    print(f"Total products: {count}")
    print(f"Categories: {cats}")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed())

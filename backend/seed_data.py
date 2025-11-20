"""
Seed script to populate MongoDB with initial data
Run this script to initialize the database with sample data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path
from auth.password import hash_password

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def clear_database():
    """Clear all collections"""
    print("🗑️  Clearing existing data...")
    collections = ['users', 'leads', 'products', 'orders', 'invoices', 'stock_movements', 'accounts', 'journal_entries']
    for collection in collections:
        await db[collection].delete_many({})
    print("✅ Database cleared")

async def seed_users():
    """Seed users"""
    print("👥 Seeding users...")
    users = [
        {
            "_id": "admin_user_001",
            "name": "Admin User",
            "email": "admin@erp.com",
            "password": hash_password("password123"),
            "role": "admin",
            "avatar": "AU",
            "phone": "+1234567890",
            "department": "Management",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "manager_user_001",
            "name": "Sarah Manager",
            "email": "sarah@erp.com",
            "password": hash_password("password123"),
            "role": "manager",
            "avatar": "SM",
            "phone": "+1234567891",
            "department": "Sales",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "employee_user_001",
            "name": "John Employee",
            "email": "john@erp.com",
            "password": hash_password("password123"),
            "role": "employee",
            "avatar": "JE",
            "phone": "+1234567892",
            "department": "Operations",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    await db.users.insert_many(users)
    print(f"✅ Created {len(users)} users")
    return users

async def seed_leads(users):
    """Seed CRM leads"""
    print("🎯 Seeding CRM leads...")
    leads = [
        {
            "name": "Acme Corp",
            "contact": "Jane Smith",
            "email": "jane@acme.com",
            "phone": "+1234567890",
            "stage": "new",
            "priority": "high",
            "expected_revenue": 50000.0,
            "probability": 20,
            "assigned_to": "manager_user_001",
            "notes": "Interested in full ERP solution",
            "created_at": datetime.utcnow() - timedelta(days=15),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "TechStart Inc",
            "contact": "Bob Johnson",
            "email": "bob@techstart.com",
            "phone": "+1234567891",
            "stage": "qualified",
            "priority": "medium",
            "expected_revenue": 35000.0,
            "probability": 50,
            "assigned_to": "employee_user_001",
            "notes": "Looking for inventory management",
            "created_at": datetime.utcnow() - timedelta(days=10),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Global Traders",
            "contact": "Alice Wong",
            "email": "alice@global.com",
            "phone": "+1234567892",
            "stage": "proposition",
            "priority": "high",
            "expected_revenue": 75000.0,
            "probability": 70,
            "assigned_to": "manager_user_001",
            "notes": "Ready to sign, waiting on proposal",
            "created_at": datetime.utcnow() - timedelta(days=20),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Local Shop",
            "contact": "Mike Brown",
            "email": "mike@local.com",
            "phone": "+1234567893",
            "stage": "negotiation",
            "priority": "medium",
            "expected_revenue": 20000.0,
            "probability": 80,
            "assigned_to": "employee_user_001",
            "notes": "Price negotiation in progress",
            "created_at": datetime.utcnow() - timedelta(days=5),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "BigCo Enterprise",
            "contact": "Emma Davis",
            "email": "emma@bigco.com",
            "phone": "+1234567894",
            "stage": "won",
            "priority": "high",
            "expected_revenue": 120000.0,
            "probability": 100,
            "assigned_to": "manager_user_001",
            "notes": "Contract signed!",
            "created_at": datetime.utcnow() - timedelta(days=25),
            "updated_at": datetime.utcnow()
        }
    ]
    result = await db.leads.insert_many(leads)
    print(f"✅ Created {len(leads)} leads")
    return result.inserted_ids

async def seed_products():
    """Seed products"""
    print("📦 Seeding products...")
    products = [
        {
            "name": "Laptop Pro 15",
            "sku": "LAP-001",
            "category": "Electronics",
            "description": "High-performance laptop",
            "price": 1299.99,
            "cost": 899.99,
            "stock": 45,
            "reorder_level": 10,
            "supplier": "Tech Supplies Co",
            "created_at": datetime.utcnow() - timedelta(days=60),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Office Chair Deluxe",
            "sku": "FUR-002",
            "category": "Furniture",
            "description": "Ergonomic office chair",
            "price": 299.99,
            "cost": 150.00,
            "stock": 120,
            "reorder_level": 20,
            "supplier": "Office Furniture Ltd",
            "created_at": datetime.utcnow() - timedelta(days=60),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Desk Lamp LED",
            "sku": "LIG-003",
            "category": "Lighting",
            "description": "Energy-efficient LED lamp",
            "price": 49.99,
            "cost": 25.00,
            "stock": 8,
            "reorder_level": 15,
            "supplier": "Lighting Direct",
            "created_at": datetime.utcnow() - timedelta(days=60),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Wireless Mouse",
            "sku": "ACC-004",
            "category": "Accessories",
            "description": "Bluetooth wireless mouse",
            "price": 29.99,
            "cost": 12.00,
            "stock": 200,
            "reorder_level": 50,
            "supplier": "Tech Supplies Co",
            "created_at": datetime.utcnow() - timedelta(days=60),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Monitor 27\" 4K",
            "sku": "MON-005",
            "category": "Electronics",
            "description": "4K Ultra HD monitor",
            "price": 599.99,
            "cost": 399.99,
            "stock": 25,
            "reorder_level": 10,
            "supplier": "Display World",
            "created_at": datetime.utcnow() - timedelta(days=60),
            "updated_at": datetime.utcnow()
        }
    ]
    result = await db.products.insert_many(products)
    print(f"✅ Created {len(products)} products")
    return result.inserted_ids

async def seed_orders(product_ids):
    """Seed orders"""
    print("🛒 Seeding orders...")
    
    # Get products for reference
    products = await db.products.find().to_list(100)
    product_map = {p["sku"]: p for p in products}
    
    orders = [
        {
            "order_number": "SO-001",
            "customer_id": "CUST-001",
            "customer_name": "Acme Corp",
            "date": datetime.utcnow() - timedelta(days=2),
            "status": "draft",
            "items": [
                {
                    "product_id": str(product_map["LAP-001"]["_id"]),
                    "product_name": "Laptop Pro 15",
                    "quantity": 3,
                    "price": 1299.99
                },
                {
                    "product_id": str(product_map["ACC-004"]["_id"]),
                    "product_name": "Wireless Mouse",
                    "quantity": 10,
                    "price": 29.99
                }
            ],
            "total": 3899.97 + 299.90,
            "approved_by": None,
            "created_by": "manager_user_001",
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow()
        },
        {
            "order_number": "SO-002",
            "customer_id": "CUST-002",
            "customer_name": "TechStart Inc",
            "date": datetime.utcnow() - timedelta(days=3),
            "status": "pending_approval",
            "items": [
                {
                    "product_id": str(product_map["FUR-002"]["_id"]),
                    "product_name": "Office Chair Deluxe",
                    "quantity": 12,
                    "price": 299.99
                }
            ],
            "total": 3599.88,
            "approved_by": None,
            "created_by": "employee_user_001",
            "created_at": datetime.utcnow() - timedelta(days=3),
            "updated_at": datetime.utcnow()
        },
        {
            "order_number": "SO-003",
            "customer_id": "CUST-003",
            "customer_name": "Global Traders",
            "date": datetime.utcnow() - timedelta(days=5),
            "status": "approved",
            "items": [
                {
                    "product_id": str(product_map["MON-005"]["_id"]),
                    "product_name": "Monitor 27\" 4K",
                    "quantity": 3,
                    "price": 599.99
                }
            ],
            "total": 1799.97,
            "approved_by": "manager_user_001",
            "created_by": "manager_user_001",
            "created_at": datetime.utcnow() - timedelta(days=5),
            "updated_at": datetime.utcnow()
        },
        {
            "order_number": "SO-004",
            "customer_id": "CUST-004",
            "customer_name": "Local Shop",
            "date": datetime.utcnow() - timedelta(days=10),
            "status": "invoiced",
            "items": [
                {
                    "product_id": str(product_map["LIG-003"]["_id"]),
                    "product_name": "Desk Lamp LED",
                    "quantity": 15,
                    "price": 49.99
                },
                {
                    "product_id": str(product_map["ACC-004"]["_id"]),
                    "product_name": "Wireless Mouse",
                    "quantity": 5,
                    "price": 29.99
                }
            ],
            "total": 749.85 + 149.95,
            "approved_by": "manager_user_001",
            "created_by": "employee_user_001",
            "created_at": datetime.utcnow() - timedelta(days=10),
            "updated_at": datetime.utcnow()
        },
        {
            "order_number": "SO-005",
            "customer_id": "CUST-005",
            "customer_name": "BigCo Enterprise",
            "date": datetime.utcnow() - timedelta(days=15),
            "status": "completed",
            "items": [
                {
                    "product_id": str(product_map["LAP-001"]["_id"]),
                    "product_name": "Laptop Pro 15",
                    "quantity": 10,
                    "price": 1299.99
                }
            ],
            "total": 12999.90,
            "approved_by": "admin_user_001",
            "created_by": "manager_user_001",
            "created_at": datetime.utcnow() - timedelta(days=15),
            "updated_at": datetime.utcnow()
        }
    ]
    result = await db.orders.insert_many(orders)
    print(f"✅ Created {len(orders)} orders")
    return result.inserted_ids

async def seed_invoices():
    """Seed invoices"""
    print("🧾 Seeding invoices...")
    invoices = [
        {
            "invoice_number": "INV-001",
            "order_id": "SO-004",
            "customer_id": "CUST-004",
            "customer_name": "Local Shop",
            "date": datetime.utcnow() - timedelta(days=8),
            "due_date": datetime.utcnow() + timedelta(days=22),
            "status": "sent",
            "total": 899.80,
            "paid": 0.0,
            "balance": 899.80,
            "created_at": datetime.utcnow() - timedelta(days=8),
            "updated_at": datetime.utcnow()
        },
        {
            "invoice_number": "INV-002",
            "order_id": "SO-005",
            "customer_id": "CUST-005",
            "customer_name": "BigCo Enterprise",
            "date": datetime.utcnow() - timedelta(days=12),
            "due_date": datetime.utcnow() + timedelta(days=18),
            "status": "paid",
            "total": 12999.90,
            "paid": 12999.90,
            "balance": 0.0,
            "created_at": datetime.utcnow() - timedelta(days=12),
            "updated_at": datetime.utcnow()
        },
        {
            "invoice_number": "INV-003",
            "order_id": "SO-003",
            "customer_id": "CUST-003",
            "customer_name": "Global Traders",
            "date": datetime.utcnow() - timedelta(days=4),
            "due_date": datetime.utcnow() - timedelta(days=1),  # Overdue
            "status": "overdue",
            "total": 1799.97,
            "paid": 0.0,
            "balance": 1799.97,
            "created_at": datetime.utcnow() - timedelta(days=4),
            "updated_at": datetime.utcnow()
        }
    ]
    result = await db.invoices.insert_many(invoices)
    print(f"✅ Created {len(invoices)} invoices")
    return result.inserted_ids

async def seed_stock_movements(product_ids):
    """Seed stock movements"""
    print("📊 Seeding stock movements...")
    
    # Get products for reference
    products = await db.products.find().to_list(100)
    product_map = {p["sku"]: p for p in products}
    
    movements = [
        {
            "product_id": str(product_map["LAP-001"]["_id"]),
            "product_name": "Laptop Pro 15",
            "type": "in",
            "quantity": 50,
            "date": datetime.utcnow() - timedelta(days=20),
            "reference": "PO-001",
            "location": "Main Warehouse",
            "created_by": "admin_user_001",
            "created_at": datetime.utcnow() - timedelta(days=20)
        },
        {
            "product_id": str(product_map["LAP-001"]["_id"]),
            "product_name": "Laptop Pro 15",
            "type": "out",
            "quantity": 5,
            "date": datetime.utcnow() - timedelta(days=2),
            "reference": "SO-001",
            "location": "Main Warehouse",
            "created_by": "manager_user_001",
            "created_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "product_id": str(product_map["LIG-003"]["_id"]),
            "product_name": "Desk Lamp LED",
            "type": "out",
            "quantity": 15,
            "date": datetime.utcnow() - timedelta(days=10),
            "reference": "SO-004",
            "location": "Main Warehouse",
            "created_by": "employee_user_001",
            "created_at": datetime.utcnow() - timedelta(days=10)
        },
        {
            "product_id": str(product_map["FUR-002"]["_id"]),
            "product_name": "Office Chair Deluxe",
            "type": "in",
            "quantity": 100,
            "date": datetime.utcnow() - timedelta(days=25),
            "reference": "PO-002",
            "location": "Main Warehouse",
            "created_by": "admin_user_001",
            "created_at": datetime.utcnow() - timedelta(days=25)
        },
        {
            "product_id": str(product_map["MON-005"]["_id"]),
            "product_name": "Monitor 27\" 4K",
            "type": "out",
            "quantity": 3,
            "date": datetime.utcnow() - timedelta(days=5),
            "reference": "SO-003",
            "location": "Main Warehouse",
            "created_by": "manager_user_001",
            "created_at": datetime.utcnow() - timedelta(days=5)
        }
    ]
    result = await db.stock_movements.insert_many(movements)
    print(f"✅ Created {len(movements)} stock movements")
    return result.inserted_ids

async def seed_accounts():
    """Seed chart of accounts"""
    print("💰 Seeding accounts...")
    accounts = [
        {
            "_id": "cash_account",
            "code": "1000",
            "name": "Cash",
            "type": "asset",
            "balance": 25899.75,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "ar_account",
            "code": "1200",
            "name": "Accounts Receivable",
            "type": "asset",
            "balance": 2699.77,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "inventory_account",
            "code": "1500",
            "name": "Inventory",
            "type": "asset",
            "balance": 158499.50,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "ap_account",
            "code": "2000",
            "name": "Accounts Payable",
            "type": "liability",
            "balance": 25000.00,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "equity_account",
            "code": "3000",
            "name": "Equity",
            "type": "equity",
            "balance": 150000.00,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "revenue_account",
            "code": "4000",
            "name": "Revenue",
            "type": "revenue",
            "balance": 45899.72,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "cogs_account",
            "code": "5000",
            "name": "Cost of Goods Sold",
            "type": "expense",
            "balance": 28400.00,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "opex_account",
            "code": "6000",
            "name": "Operating Expenses",
            "type": "expense",
            "balance": 15699.45,
            "created_at": datetime.utcnow() - timedelta(days=90),
            "updated_at": datetime.utcnow()
        }
    ]
    result = await db.accounts.insert_many(accounts)
    print(f"✅ Created {len(accounts)} accounts")
    return result.inserted_ids

async def seed_journal_entries():
    """Seed journal entries"""
    print("📝 Seeding journal entries...")
    entries = [
        {
            "date": datetime.utcnow() - timedelta(days=12),
            "reference": "INV-002",
            "description": "Payment received from BigCo Enterprise",
            "account_id": "cash_account",
            "account_name": "Cash",
            "debit": 12999.90,
            "credit": 0.0,
            "status": "posted",
            "created_by": "admin_user_001",
            "created_at": datetime.utcnow() - timedelta(days=12)
        },
        {
            "date": datetime.utcnow() - timedelta(days=12),
            "reference": "INV-002",
            "description": "Payment received from BigCo Enterprise",
            "account_id": "ar_account",
            "account_name": "Accounts Receivable",
            "debit": 0.0,
            "credit": 12999.90,
            "status": "posted",
            "created_by": "admin_user_001",
            "created_at": datetime.utcnow() - timedelta(days=12)
        },
        {
            "date": datetime.utcnow() - timedelta(days=8),
            "reference": "INV-001",
            "description": "Invoice issued to Local Shop",
            "account_id": "ar_account",
            "account_name": "Accounts Receivable",
            "debit": 899.80,
            "credit": 0.0,
            "status": "posted",
            "created_by": "manager_user_001",
            "created_at": datetime.utcnow() - timedelta(days=8)
        },
        {
            "date": datetime.utcnow() - timedelta(days=8),
            "reference": "INV-001",
            "description": "Revenue from sales",
            "account_id": "revenue_account",
            "account_name": "Revenue",
            "debit": 0.0,
            "credit": 899.80,
            "status": "posted",
            "created_by": "manager_user_001",
            "created_at": datetime.utcnow() - timedelta(days=8)
        },
        {
            "date": datetime.utcnow() - timedelta(days=25),
            "reference": "PO-002",
            "description": "Purchase of office chairs",
            "account_id": "ap_account",
            "account_name": "Accounts Payable",
            "debit": 0.0,
            "credit": 15000.00,
            "status": "posted",
            "created_by": "admin_user_001",
            "created_at": datetime.utcnow() - timedelta(days=25)
        }
    ]
    result = await db.journal_entries.insert_many(entries)
    print(f"✅ Created {len(entries)} journal entries")
    return result.inserted_ids

async def main():
    """Main seed function"""
    print("\n" + "="*50)
    print("🌱 Starting Database Seeding Process")
    print("="*50 + "\n")
    
    try:
        # Clear existing data
        await clear_database()
        
        # Seed data in order
        users = await seed_users()
        await seed_leads(users)
        product_ids = await seed_products()
        await seed_orders(product_ids)
        await seed_invoices()
        await seed_stock_movements(product_ids)
        await seed_accounts()
        await seed_journal_entries()
        
        print("\n" + "="*50)
        print("✅ Database Seeding Complete!")
        print("="*50)
        print("\n📊 Summary:")
        print("   - 3 Users (admin, manager, employee)")
        print("   - 5 CRM Leads")
        print("   - 5 Products")
        print("   - 5 Sales Orders")
        print("   - 3 Invoices")
        print("   - 5 Stock Movements")
        print("   - 8 Accounts")
        print("   - 5 Journal Entries")
        print("\n🔐 Login Credentials:")
        print("   Admin:    admin@erp.com / password123")
        print("   Manager:  sarah@erp.com / password123")
        print("   Employee: john@erp.com / password123")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())

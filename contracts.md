# ERP System - Backend Integration Contracts

## Overview
This document outlines the API contracts, data models, and integration plan for the ERP system backend.

---

## 1. Data Models (MongoDB Schemas)

### 1.1 Users
```python
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique, indexed),
  "password": String (hashed),
  "role": Enum["admin", "manager", "employee"],
  "avatar": String,
  "phone": String (optional),
  "department": String (optional),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### 1.2 Leads (CRM)
```python
{
  "_id": ObjectId,
  "name": String,  # Company name
  "contact": String,  # Contact person
  "email": String,
  "phone": String,
  "stage": Enum["new", "qualified", "proposition", "negotiation", "won", "lost"],
  "priority": Enum["high", "medium", "low"],
  "expected_revenue": Float,
  "probability": Int (0-100),
  "assigned_to": ObjectId (ref: Users),
  "notes": String,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### 1.3 Products (Inventory) - COM VARIANTES
```python
{
  "_id": ObjectId,
  "name": String,
  "sku": String (unique, indexed),
  "category": String,
  "family": String,  # Família do produto
  "sub_family": String,  # Subfamília
  "description": String,
  "supplier": String,
  "status": Enum["active", "inactive"],
  
  # Campos legados (para compatibilidade com produtos sem variantes)
  "price": Float (optional),
  "cost": Float (optional),
  "stock": Int (optional),
  "reorder_level": Int (optional),
  
  # VARIANTES DO PRODUTO
  "variants": [
    {
      "variant_id": String,  # Gerado automaticamente
      "name": String (optional),  # Ex: "140x190 - Bege"
      "attributes": [
        {"name": "Tamanho", "value": "140x190"},
        {"name": "Cor", "value": "Bege"}
      ],
      "price_tiers": [  # FAIXAS DE PREÇO POR VARIANTE
        {
          "name": "normal",  # Nome da faixa
          "price": 1500.00,  # Preço
          "commission_percent": 5.0  # Percentual de comissão
        },
        {
          "name": "site",
          "price": 1450.00,
          "commission_percent": 4.0
        },
        {
          "name": "promo",
          "price": 1300.00,
          "commission_percent": 2.0
        }
      ],
      "stock": Int  # Estoque específico da variante
    }
  ],
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Exemplo de Produto com 2 Variantes:**
```json
{
  "name": "Colchão Premium",
  "sku": "COL-PREM-001",
  "category": "Móveis",
  "family": "Colchões",
  "sub_family": "Espuma",
  "supplier": "Fornecedor XYZ",
  "status": "active",
  "variants": [
    {
      "variant_id": "VAR-001-1234567890",
      "name": "140x190 - Bege",
      "attributes": [
        {"name": "Tamanho", "value": "140x190"},
        {"name": "Cor", "value": "Bege"}
      ],
      "price_tiers": [
        {"name": "normal", "price": 1500.00, "commission_percent": 5.0},
        {"name": "site", "price": 1450.00, "commission_percent": 4.0},
        {"name": "promo", "price": 1300.00, "commission_percent": 2.0}
      ],
      "stock": 20
    },
    {
      "variant_id": "VAR-002-1234567891",
      "name": "160x200 - Branco",
      "attributes": [
        {"name": "Tamanho", "value": "160x200"},
        {"name": "Cor", "value": "Branco"}
      ],
      "price_tiers": [
        {"name": "normal", "price": 1800.00, "commission_percent": 6.0},
        {"name": "site", "price": 1750.00, "commission_percent": 5.0},
        {"name": "promo", "price": 1600.00, "commission_percent": 3.0}
      ],
      "stock": 15
    }
  ]
}
```

### 1.4 Orders (Sales)
```python
{
  "_id": ObjectId,
  "order_number": String (auto-generated: "SO-XXX"),
  "customer_id": String,
  "customer_name": String,
  "date": DateTime,
  "status": Enum["draft", "pending_approval", "approved", "invoiced", "completed", "cancelled"],
  "items": [
    {
      "product_id": ObjectId (ref: Products),
      "product_name": String,
      "quantity": Int,
      "price": Float
    }
  ],
  "total": Float,
  "approved_by": ObjectId (ref: Users, nullable),
  "created_by": ObjectId (ref: Users),
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### 1.5 Invoices
```python
{
  "_id": ObjectId,
  "invoice_number": String (auto-generated: "INV-XXX"),
  "order_id": ObjectId (ref: Orders),
  "customer_id": String,
  "customer_name": String,
  "date": DateTime,
  "due_date": DateTime,
  "status": Enum["draft", "sent", "paid", "overdue"],
  "total": Float,
  "paid": Float,
  "balance": Float,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### 1.6 StockMovements
```python
{
  "_id": ObjectId,
  "product_id": ObjectId (ref: Products),
  "product_name": String,
  "type": Enum["in", "out"],
  "quantity": Int,
  "date": DateTime,
  "reference": String,  # PO-XXX or SO-XXX
  "location": String,
  "created_by": ObjectId (ref: Users),
  "created_at": DateTime
}
```

### 1.7 Accounts (Accounting)
```python
{
  "_id": ObjectId,
  "code": String (unique),
  "name": String,
  "type": Enum["asset", "liability", "equity", "revenue", "expense"],
  "balance": Float,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### 1.8 JournalEntries
```python
{
  "_id": ObjectId,
  "date": DateTime,
  "reference": String,  # INV-XXX, SO-XXX, etc.
  "description": String,
  "account_id": ObjectId (ref: Accounts),
  "account_name": String,
  "debit": Float,
  "credit": Float,
  "status": Enum["draft", "posted"],
  "created_by": ObjectId (ref: Users),
  "created_at": DateTime
}
```

---

## 2. API Endpoints

### 2.1 Authentication APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/api/auth/login` | User login, returns JWT token | No | All |
| POST | `/api/auth/register` | Register new user | No | - |
| GET | `/api/auth/me` | Get current user info | Yes | All |

### 2.2 User Management APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/users` | List all users | Yes | Admin, Manager |
| GET | `/api/users/{id}` | Get user by ID | Yes | All |
| POST | `/api/users` | Create new user | Yes | Admin |
| PUT | `/api/users/{id}` | Update user | Yes | Admin |
| DELETE | `/api/users/{id}` | Delete user | Yes | Admin |

### 2.3 CRM APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/leads` | List all leads | Yes | All |
| GET | `/api/leads/{id}` | Get lead by ID | Yes | All |
| POST | `/api/leads` | Create new lead | Yes | All |
| PUT | `/api/leads/{id}` | Update lead | Yes | All |
| DELETE | `/api/leads/{id}` | Delete lead | Yes | Admin, Manager |
| PUT | `/api/leads/{id}/stage` | Update lead stage | Yes | All |

### 2.4 Sales APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/orders` | List all orders | Yes | All |
| GET | `/api/orders/{id}` | Get order by ID | Yes | All |
| POST | `/api/orders` | Create new order | Yes | All |
| PUT | `/api/orders/{id}` | Update order | Yes | All |
| DELETE | `/api/orders/{id}` | Delete order | Yes | Admin |
| PUT | `/api/orders/{id}/approve` | Approve order | Yes | Admin, Manager |
| PUT | `/api/orders/{id}/reject` | Reject order | Yes | Admin, Manager |

### 2.5 Invoice APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/invoices` | List all invoices | Yes | All |
| GET | `/api/invoices/{id}` | Get invoice by ID | Yes | All |
| POST | `/api/invoices` | Create invoice from order | Yes | All |
| PUT | `/api/invoices/{id}/status` | Update invoice status | Yes | Admin, Manager |

### 2.6 Inventory APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/products` | List all products | Yes | All |
| GET | `/api/products/{id}` | Get product by ID | Yes | All |
| POST | `/api/products` | Create new product | Yes | Admin, Manager |
| PUT | `/api/products/{id}` | Update product | Yes | Admin, Manager |
| DELETE | `/api/products/{id}` | Delete product | Yes | Admin |
| GET | `/api/stock-movements` | List stock movements | Yes | All |
| POST | `/api/stock-movements` | Record stock movement | Yes | Admin, Manager |

### 2.7 Accounting APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/accounts` | List all accounts | Yes | Admin, Manager |
| GET | `/api/accounts/{id}` | Get account by ID | Yes | Admin, Manager |
| POST | `/api/accounts` | Create new account | Yes | Admin |
| PUT | `/api/accounts/{id}` | Update account | Yes | Admin |
| GET | `/api/journal-entries` | List journal entries | Yes | Admin, Manager |
| POST | `/api/journal-entries` | Create journal entry | Yes | Admin, Manager |
| GET | `/api/reports/balance-sheet` | Get balance sheet | Yes | Admin, Manager |
| GET | `/api/reports/income-statement` | Get income statement | Yes | Admin, Manager |

### 2.8 Dashboard APIs
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | Yes | All |

---

## 3. Business Logic & Workflows

### 3.1 Order Approval Workflow
1. Order created with status "draft"
2. When submitted → status changes to "pending_approval"
3. Manager/Admin approves → status changes to "approved"
4. Stock is deducted from inventory
5. Invoice is automatically created
6. Journal entries are posted (Debit: AR, Credit: Revenue)

### 3.2 Stock Movement Logic
- **Order Approved**: Create "out" movement, reduce product stock
- **Purchase Order**: Create "in" movement, increase product stock
- **Low Stock Alert**: If stock < reorder_level, flag product

### 3.3 Invoice Status Updates
- **Draft**: Initial state
- **Sent**: Invoice sent to customer
- **Paid**: Payment received, create journal entry (Debit: Cash, Credit: AR)
- **Overdue**: Due date passed, status auto-updated

### 3.4 Journal Entry Automation
- **Invoice Created**: DR Accounts Receivable, CR Revenue
- **Payment Received**: DR Cash, CR Accounts Receivable
- **Purchase**: DR Inventory, CR Accounts Payable

---

## 4. Authentication & Authorization

### 4.1 JWT Token Structure
```python
{
  "user_id": ObjectId,
  "email": String,
  "role": String,
  "exp": DateTime (expiry)
}
```

### 4.2 Password Security
- Passwords hashed using `passlib` with bcrypt
- Never store plain text passwords
- Minimum password length: 8 characters

### 4.3 Role-Based Access Control (RBAC)
| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all modules, user management, system settings |
| **Manager** | Approve workflows, view reports, manage assigned modules |
| **Employee** | Create/edit own records, limited module access |

---

## 5. Frontend Integration Plan

### 5.1 Files to Update
1. **context/AuthContext.jsx** - Replace mock login with API call
2. **pages/Dashboard.jsx** - Fetch stats from `/api/dashboard/stats`
3. **pages/CRM.jsx** - Fetch leads from `/api/leads`
4. **pages/Sales.jsx** - Fetch orders from `/api/orders`, implement approve/reject
5. **pages/Inventory.jsx** - Fetch products from `/api/products`
6. **pages/Accounting.jsx** - Fetch accounts and entries
7. **pages/Settings.jsx** - Fetch users from `/api/users`

### 5.2 API Utility
Create `/frontend/src/utils/api.js`:
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 6. Mock Data Migration

All data currently in `mockData.js` will be:
1. Seeded into MongoDB via a seed script
2. Removed from frontend
3. Fetched via API calls

---

## 7. Error Handling

### Backend
- Use FastAPI's HTTPException for errors
- Return structured error responses:
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

### Frontend
- Show user-friendly error messages via toast notifications
- Handle 401 (unauthorized) by redirecting to login
- Handle 403 (forbidden) by showing access denied message

---

## 8. Testing Checklist

- [ ] User registration and login
- [ ] JWT token validation
- [ ] Role-based access control
- [ ] CRUD operations for all entities
- [ ] Order approval workflow
- [ ] Stock deduction on order approval
- [ ] Invoice creation and payment
- [ ] Journal entry automation
- [ ] Dashboard statistics accuracy
- [ ] Frontend-backend integration

---

## Implementation Order

1. ✅ Setup MongoDB models
2. ✅ Implement authentication APIs
3. ✅ Build user management APIs
4. ✅ Create CRM APIs
5. ✅ Build Sales & Invoice APIs with workflows
6. ✅ Implement Inventory APIs with stock logic
7. ✅ Create Accounting APIs with automation
8. ✅ Build Dashboard API
9. ✅ Update frontend to use real APIs
10. ✅ Test entire system end-to-end

---

End of Contracts Document

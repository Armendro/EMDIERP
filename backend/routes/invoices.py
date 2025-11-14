from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from bson import ObjectId

from models.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/invoices", tags=["Sales"])

# Get database
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

async def generate_invoice_number():
    """Generate next invoice number"""
    last_invoice = await db.invoices.find_one(sort=[("created_at", -1)])
    if last_invoice and "invoice_number" in last_invoice:
        num = int(last_invoice["invoice_number"].split("-")[1]) + 1
    else:
        num = 1
    return f"INV-{num:03d}"

@router.get("", response_model=List[InvoiceResponse])
async def get_invoices(current_user: dict = Depends(get_current_user)):
    """
    Get all invoices
    """
    invoices = await db.invoices.find().to_list(1000)
    return [
        {
            "id": str(invoice["_id"]),
            "invoice_number": invoice["invoice_number"],
            "order_id": invoice["order_id"],
            "customer_id": invoice["customer_id"],
            "customer_name": invoice["customer_name"],
            "date": invoice["date"],
            "due_date": invoice["due_date"],
            "status": invoice["status"],
            "total": invoice["total"],
            "paid": invoice["paid"],
            "balance": invoice["balance"],
            "created_at": invoice["created_at"],
            "updated_at": invoice["updated_at"]
        }
        for invoice in invoices
    ]

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get invoice by ID
    """
    invoice = await db.invoices.find_one({"_id": ObjectId(invoice_id)})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {
        "id": str(invoice["_id"]),
        "invoice_number": invoice["invoice_number"],
        "order_id": invoice["order_id"],
        "customer_id": invoice["customer_id"],
        "customer_name": invoice["customer_name"],
        "date": invoice["date"],
        "due_date": invoice["due_date"],
        "status": invoice["status"],
        "total": invoice["total"],
        "paid": invoice["paid"],
        "balance": invoice["balance"],
        "created_at": invoice["created_at"],
        "updated_at": invoice["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create invoice from order
    """
    # Verify order exists
    order = await db.orders.find_one({"_id": ObjectId(invoice_data.order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    invoice_dict = invoice_data.dict()
    invoice_dict["invoice_number"] = await generate_invoice_number()
    invoice_dict["date"] = datetime.utcnow()
    invoice_dict["balance"] = invoice_dict["total"] - invoice_dict["paid"]
    invoice_dict["created_at"] = datetime.utcnow()
    invoice_dict["updated_at"] = datetime.utcnow()
    
    result = await db.invoices.insert_one(invoice_dict)
    
    # Update order status to invoiced
    await db.orders.update_one(
        {"_id": ObjectId(invoice_data.order_id)},
        {"$set": {"status": "invoiced", "updated_at": datetime.utcnow()}}
    )
    
    return {
        "message": "Invoice created successfully",
        "invoice_id": str(result.inserted_id),
        "invoice_number": invoice_dict["invoice_number"]
    }

@router.put("/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: str,
    update_data: InvoiceUpdate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Update invoice status and payment
    """
    invoice = await db.invoices.find_one({"_id": ObjectId(invoice_id)})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items()}
    
    # Calculate balance
    paid = update_dict.get("paid", invoice["paid"])
    update_dict["balance"] = invoice["total"] - paid
    update_dict["updated_at"] = datetime.utcnow()
    
    # If marked as paid, create journal entry
    if update_dict.get("status") == "paid" and invoice["status"] != "paid":
        journal_entries = [
            {
                "date": datetime.utcnow(),
                "reference": invoice["invoice_number"],
                "description": f"Payment received from {invoice['customer_name']}",
                "account_id": "cash_account",
                "account_name": "Cash",
                "debit": invoice["total"],
                "credit": 0,
                "status": "posted",
                "created_by": str(current_user["_id"]),
                "created_at": datetime.utcnow()
            },
            {
                "date": datetime.utcnow(),
                "reference": invoice["invoice_number"],
                "description": f"Payment received from {invoice['customer_name']}",
                "account_id": "ar_account",
                "account_name": "Accounts Receivable",
                "debit": 0,
                "credit": invoice["total"],
                "status": "posted",
                "created_by": str(current_user["_id"]),
                "created_at": datetime.utcnow()
            }
        ]
        await db.journal_entries.insert_many(journal_entries)
    
    result = await db.invoices.update_one(
        {"_id": ObjectId(invoice_id)},
        {"$set": update_dict}
    )
    
    return {"message": "Invoice updated successfully"}
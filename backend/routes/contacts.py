from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models.contact import ContactCreate, ContactUpdate, ContactResponse
from auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/contacts", tags=["Contacts"])

from database import db

@router.get("", response_model=List[ContactResponse])
async def get_contacts(
    is_customer: Optional[bool] = Query(None),
    is_supplier: Optional[bool] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all contacts with optional filters
    """
    query = {}
    
    if is_customer is not None:
        query["is_customer"] = is_customer
    
    if is_supplier is not None:
        query["is_supplier"] = is_supplier
    
    contacts = await db.contacts.find(query).to_list(1000)
    
    return [
        {
            "id": str(contact["_id"]),
            "is_customer": contact["is_customer"],
            "is_supplier": contact["is_supplier"],
            "type": contact["type"],
            "name": contact["name"],
            "trade_name": contact.get("trade_name"),
            "nif": contact["nif"],
            "email": contact["email"],
            "phone": contact.get("phone"),
            "mobile": contact.get("mobile"),
            "website": contact.get("website"),
            "billing_address_line1": contact["billing_address_line1"],
            "billing_postal_code": contact["billing_postal_code"],
            "billing_city": contact["billing_city"],
            "billing_country": contact["billing_country"],
            "shipping_same_as_billing": contact["shipping_same_as_billing"],
            "shipping_address_line1": contact.get("shipping_address_line1"),
            "shipping_postal_code": contact.get("shipping_postal_code"),
            "shipping_city": contact.get("shipping_city"),
            "shipping_country": contact.get("shipping_country"),
            "customer_type": contact.get("customer_type"),
            "payment_terms": contact.get("payment_terms"),
            "credit_limit": contact.get("credit_limit"),
            "supplier_type": contact.get("supplier_type"),
            "iban": contact.get("iban"),
            "bank_name": contact.get("bank_name"),
            "swift_bic": contact.get("swift_bic"),
            "status": contact["status"],
            "notes": contact.get("notes"),
            "created_at": contact["created_at"],
            "updated_at": contact["updated_at"]
        }
        for contact in contacts
    ]

@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get contact by ID
    """
    contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {
        "id": str(contact["_id"]),
        "is_customer": contact["is_customer"],
        "is_supplier": contact["is_supplier"],
        "type": contact["type"],
        "name": contact["name"],
        "trade_name": contact.get("trade_name"),
        "nif": contact["nif"],
        "email": contact["email"],
        "phone": contact.get("phone"),
        "mobile": contact.get("mobile"),
        "website": contact.get("website"),
        "billing_address_line1": contact["billing_address_line1"],
        "billing_postal_code": contact["billing_postal_code"],
        "billing_city": contact["billing_city"],
        "billing_country": contact["billing_country"],
        "shipping_same_as_billing": contact["shipping_same_as_billing"],
        "shipping_address_line1": contact.get("shipping_address_line1"),
        "shipping_postal_code": contact.get("shipping_postal_code"),
        "shipping_city": contact.get("shipping_city"),
        "shipping_country": contact.get("shipping_country"),
        "customer_type": contact.get("customer_type"),
        "payment_terms": contact.get("payment_terms"),
        "credit_limit": contact.get("credit_limit"),
        "supplier_type": contact.get("supplier_type"),
        "iban": contact.get("iban"),
        "bank_name": contact.get("bank_name"),
        "swift_bic": contact.get("swift_bic"),
        "status": contact["status"],
        "notes": contact.get("notes"),
        "created_at": contact["created_at"],
        "updated_at": contact["updated_at"]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Create a new contact
    """
    # Check if NIF already exists
    existing_contact = await db.contacts.find_one({"nif": contact_data.nif})
    if existing_contact:
        raise HTTPException(
            status_code=400,
            detail="Contact with this NIF already exists"
        )
    
    contact_dict = contact_data.dict()
    contact_dict["created_at"] = datetime.utcnow()
    contact_dict["updated_at"] = datetime.utcnow()
    
    result = await db.contacts.insert_one(contact_dict)
    
    return {
        "message": "Contact created successfully",
        "contact_id": str(result.inserted_id)
    }

@router.put("/{contact_id}")
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdate,
    current_user: dict = Depends(require_roles(["admin", "manager"]))
):
    """
    Update contact
    """
    update_data = {k: v for k, v in contact_data.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact updated successfully"}

@router.delete("/{contact_id}")
async def delete_contact(
    contact_id: str,
    current_user: dict = Depends(require_roles(["admin"]))
):
    """
    Delete contact (soft delete - marks as inactive)
    """
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {"status": "inactive", "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact marked as inactive"}

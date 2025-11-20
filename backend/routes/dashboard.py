from fastapi import APIRouter, Depends


from auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Get database
from database import db

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Get dashboard statistics
    """
    # CRM Stats
    total_leads = await db.leads.count_documents({})
    active_leads = await db.leads.count_documents({"stage": {"$nin": ["won", "lost"]}})
    won_leads = await db.leads.count_documents({"stage": "won"})
    
    leads_cursor = db.leads.find({})
    expected_revenue = 0
    async for lead in leads_cursor:
        expected_revenue += lead.get("expected_revenue", 0)
    
    conversion_rate = (won_leads / total_leads * 100) if total_leads > 0 else 0
    
    # Sales Stats
    total_orders = await db.orders.count_documents({})
    pending_approval = await db.orders.count_documents({"status": "pending_approval"})
    
    orders_cursor = db.orders.find({})
    monthly_revenue = 0
    async for order in orders_cursor:
        if order.get("status") in ["approved", "invoiced", "completed"]:
            monthly_revenue += order.get("total", 0)
    
    avg_order_value = monthly_revenue / total_orders if total_orders > 0 else 0
    
    # Inventory Stats
    total_products = await db.products.count_documents({})
    low_stock = await db.products.count_documents({"$expr": {"$lt": ["$stock", "$reorder_level"]}})
    
    products_cursor = db.products.find({})
    total_value = 0
    reorder_needed = []
    async for product in products_cursor:
        total_value += product.get("stock", 0) * product.get("cost", 0)
        if product.get("stock", 0) < product.get("reorder_level", 0):
            reorder_needed.append(product.get("sku", ""))
    
    # Accounting Stats
    accounts_cursor = db.accounts.find({})
    ar_balance = 0
    ap_balance = 0
    cash_balance = 0
    revenue_total = 0
    expense_total = 0
    
    async for account in accounts_cursor:
        if account.get("name") == "Accounts Receivable":
            ar_balance = account.get("balance", 0)
        elif account.get("name") == "Accounts Payable":
            ap_balance = account.get("balance", 0)
        elif account.get("name") == "Cash":
            cash_balance = account.get("balance", 0)
        elif account.get("type") == "revenue":
            revenue_total += account.get("balance", 0)
        elif account.get("type") == "expense":
            expense_total += account.get("balance", 0)
    
    net_income = revenue_total - expense_total
    
    # Overdue invoices
    overdue_invoices = await db.invoices.count_documents({"status": "overdue"})
    
    return {
        "crm": {
            "totalLeads": total_leads,
            "activeLeads": active_leads,
            "wonLeads": won_leads,
            "conversionRate": round(conversion_rate, 1),
            "expectedRevenue": round(expected_revenue, 2)
        },
        "sales": {
            "totalOrders": total_orders,
            "pendingApproval": pending_approval,
            "monthlyRevenue": round(monthly_revenue, 2),
            "avgOrderValue": round(avg_order_value, 2)
        },
        "inventory": {
            "totalProducts": total_products,
            "lowStock": low_stock,
            "totalValue": round(total_value, 2),
            "reorderNeeded": reorder_needed
        },
        "accounting": {
            "accountsReceivable": round(ar_balance, 2),
            "accountsPayable": round(ap_balance, 2),
            "cashBalance": round(cash_balance, 2),
            "netIncome": round(net_income, 2)
        },
        "overdueInvoices": overdue_invoices
    }

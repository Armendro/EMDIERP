// Mock data for ERP system

export const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@erp.com', role: 'admin', avatar: 'AU' },
  { id: '2', name: 'Sarah Manager', email: 'sarah@erp.com', role: 'manager', avatar: 'SM' },
  { id: '3', name: 'John Employee', email: 'john@erp.com', role: 'employee', avatar: 'JE' }
];

export const mockLeads = [
  { id: '1', name: 'Acme Corp', contact: 'Jane Smith', email: 'jane@acme.com', phone: '+1234567890', stage: 'new', priority: 'high', expectedRevenue: 50000, probability: 20, assignedTo: '2', createdAt: '2025-01-15', notes: 'Interested in full ERP solution' },
  { id: '2', name: 'TechStart Inc', contact: 'Bob Johnson', email: 'bob@techstart.com', phone: '+1234567891', stage: 'qualified', priority: 'medium', expectedRevenue: 35000, probability: 50, assignedTo: '3', createdAt: '2025-01-20', notes: 'Looking for inventory management' },
  { id: '3', name: 'Global Traders', contact: 'Alice Wong', email: 'alice@global.com', phone: '+1234567892', stage: 'proposition', priority: 'high', expectedRevenue: 75000, probability: 70, assignedTo: '2', createdAt: '2025-01-10', notes: 'Ready to sign, waiting on proposal' },
  { id: '4', name: 'Local Shop', contact: 'Mike Brown', email: 'mike@local.com', phone: '+1234567893', stage: 'negotiation', priority: 'medium', expectedRevenue: 20000, probability: 80, assignedTo: '3', createdAt: '2025-01-25', notes: 'Price negotiation in progress' },
  { id: '5', name: 'BigCo Enterprise', contact: 'Emma Davis', email: 'emma@bigco.com', phone: '+1234567894', stage: 'won', priority: 'high', expectedRevenue: 120000, probability: 100, assignedTo: '2', createdAt: '2025-01-05', notes: 'Contract signed!' }
];

export const crmStages = [
  { id: 'new', name: 'New', color: '#64748b' },
  { id: 'qualified', name: 'Qualified', color: '#3b82f6' },
  { id: 'proposition', name: 'Proposition', color: '#8b5cf6' },
  { id: 'negotiation', name: 'Negotiation', color: '#f59e0b' },
  { id: 'won', name: 'Won', color: '#10b981' },
  { id: 'lost', name: 'Lost', color: '#ef4444' }
];

export const mockProducts = [
  { id: '1', name: 'Laptop Pro 15', sku: 'LAP-001', category: 'Electronics', price: 1299.99, cost: 899.99, stock: 45, reorderLevel: 10, supplier: 'Tech Supplies Co', description: 'High-performance laptop' },
  { id: '2', name: 'Office Chair Deluxe', sku: 'FUR-002', category: 'Furniture', price: 299.99, cost: 150.00, stock: 120, reorderLevel: 20, supplier: 'Office Furniture Ltd', description: 'Ergonomic office chair' },
  { id: '3', name: 'Desk Lamp LED', sku: 'LIG-003', category: 'Lighting', price: 49.99, cost: 25.00, stock: 8, reorderLevel: 15, supplier: 'Lighting Direct', description: 'Energy-efficient LED lamp' },
  { id: '4', name: 'Wireless Mouse', sku: 'ACC-004', category: 'Accessories', price: 29.99, cost: 12.00, stock: 200, reorderLevel: 50, supplier: 'Tech Supplies Co', description: 'Bluetooth wireless mouse' },
  { id: '5', name: 'Monitor 27" 4K', sku: 'MON-005', category: 'Electronics', price: 599.99, cost: 399.99, stock: 25, reorderLevel: 10, supplier: 'Display World', description: '4K Ultra HD monitor' }
];

export const mockOrders = [
  { id: 'SO-001', customerId: '1', customerName: 'Acme Corp', date: '2025-01-28', status: 'draft', total: 5299.95, items: [{ productId: '1', productName: 'Laptop Pro 15', quantity: 3, price: 1299.99 }, { productId: '4', productName: 'Wireless Mouse', quantity: 10, price: 29.99 }], approvedBy: null },
  { id: 'SO-002', customerId: '2', customerName: 'TechStart Inc', date: '2025-01-27', status: 'pending_approval', total: 3599.95, items: [{ productId: '2', productName: 'Office Chair Deluxe', quantity: 12, price: 299.99 }], approvedBy: null },
  { id: 'SO-003', customerId: '3', customerName: 'Global Traders', date: '2025-01-25', status: 'approved', total: 1799.97, items: [{ productId: '5', productName: 'Monitor 27" 4K', quantity: 3, price: 599.99 }], approvedBy: '2' },
  { id: 'SO-004', customerId: '4', customerName: 'Local Shop', date: '2025-01-20', status: 'invoiced', total: 899.85, items: [{ productId: '3', productName: 'Desk Lamp LED', quantity: 15, price: 49.99 }, { productId: '4', productName: 'Wireless Mouse', quantity: 5, price: 29.99 }], approvedBy: '2' },
  { id: 'SO-005', customerId: '5', customerName: 'BigCo Enterprise', date: '2025-01-15', status: 'completed', total: 12999.90, items: [{ productId: '1', productName: 'Laptop Pro 15', quantity: 10, price: 1299.99 }], approvedBy: '1' }
];

export const mockInvoices = [
  { id: 'INV-001', orderId: 'SO-004', customerId: '4', customerName: 'Local Shop', date: '2025-01-22', dueDate: '2025-02-21', status: 'sent', total: 899.85, paid: 0, balance: 899.85 },
  { id: 'INV-002', orderId: 'SO-005', customerId: '5', customerName: 'BigCo Enterprise', date: '2025-01-18', dueDate: '2025-02-17', status: 'paid', total: 12999.90, paid: 12999.90, balance: 0 },
  { id: 'INV-003', orderId: 'SO-003', customerId: '3', customerName: 'Global Traders', date: '2025-01-26', dueDate: '2025-02-25', status: 'overdue', total: 1799.97, paid: 0, balance: 1799.97 }
];

export const mockStockMovements = [
  { id: '1', productId: '1', productName: 'Laptop Pro 15', type: 'in', quantity: 50, date: '2025-01-10', reference: 'PO-001', location: 'Main Warehouse' },
  { id: '2', productId: '1', productName: 'Laptop Pro 15', type: 'out', quantity: 5, date: '2025-01-28', reference: 'SO-001', location: 'Main Warehouse' },
  { id: '3', productId: '3', productName: 'Desk Lamp LED', type: 'out', quantity: 15, date: '2025-01-20', reference: 'SO-004', location: 'Main Warehouse' },
  { id: '4', productId: '2', productName: 'Office Chair Deluxe', type: 'in', quantity: 100, date: '2025-01-15', reference: 'PO-002', location: 'Main Warehouse' },
  { id: '5', productId: '5', productName: 'Monitor 27" 4K', type: 'out', quantity: 3, date: '2025-01-25', reference: 'SO-003', location: 'Main Warehouse' }
];

export const mockJournalEntries = [
  { id: '1', date: '2025-01-28', reference: 'INV-002', description: 'Payment received from BigCo Enterprise', debit: 12999.90, credit: 0, account: 'Cash', status: 'posted' },
  { id: '2', date: '2025-01-28', reference: 'INV-002', description: 'Revenue from sales', debit: 0, credit: 12999.90, account: 'Revenue', status: 'posted' },
  { id: '3', date: '2025-01-22', reference: 'INV-001', description: 'Invoice issued to Local Shop', debit: 899.85, credit: 0, account: 'Accounts Receivable', status: 'posted' },
  { id: '4', date: '2025-01-22', reference: 'INV-001', description: 'Revenue from sales', debit: 0, credit: 899.85, account: 'Revenue', status: 'posted' },
  { id: '5', date: '2025-01-15', reference: 'PO-002', description: 'Purchase of office chairs', debit: 0, credit: 15000.00, account: 'Accounts Payable', status: 'posted' }
];

export const mockAccounts = [
  { id: '1', code: '1000', name: 'Cash', type: 'asset', balance: 25899.75 },
  { id: '2', code: '1200', name: 'Accounts Receivable', type: 'asset', balance: 2699.82 },
  { id: '3', code: '1500', name: 'Inventory', type: 'asset', balance: 158499.50 },
  { id: '4', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 25000.00 },
  { id: '5', code: '3000', name: 'Equity', type: 'equity', balance: 150000.00 },
  { id: '6', code: '4000', name: 'Revenue', type: 'revenue', balance: 45899.72 },
  { id: '7', code: '5000', name: 'Cost of Goods Sold', type: 'expense', balance: 28400.00 },
  { id: '8', code: '6000', name: 'Operating Expenses', type: 'expense', balance: 15699.45 }
];

export const dashboardStats = {
  crm: {
    totalLeads: 5,
    activeLeads: 4,
    wonLeads: 1,
    conversionRate: 20,
    expectedRevenue: 300000
  },
  sales: {
    totalOrders: 5,
    pendingApproval: 1,
    monthlyRevenue: 45899.72,
    avgOrderValue: 9179.94
  },
  inventory: {
    totalProducts: 5,
    lowStock: 1,
    totalValue: 158499.50,
    reorderNeeded: ['LAP-003']
  },
  accounting: {
    accountsReceivable: 2699.82,
    accountsPayable: 25000.00,
    cashBalance: 25899.75,
    netIncome: 1800.27
  }
};
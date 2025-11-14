import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { dashboardStats, mockLeads, mockOrders, mockInvoices } from '../mockData';
import { TrendingUp, Users, ShoppingCart, Package, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { crm, sales, inventory, accounting } = dashboardStats;

  const statCards = [
    { title: 'Total Revenue', value: `$${sales.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', change: '+12.5%', path: '/sales' },
    { title: 'Active Leads', value: crm.activeLeads, icon: Users, color: 'from-blue-500 to-cyan-600', change: `${crm.conversionRate}% conversion`, path: '/crm' },
    { title: 'Pending Orders', value: sales.pendingApproval, icon: Clock, color: 'from-orange-500 to-amber-600', change: 'Need approval', path: '/sales' },
    { title: 'Low Stock Items', value: inventory.lowStock, icon: AlertTriangle, color: 'from-red-500 to-rose-600', change: 'Reorder needed', path: '/inventory' }
  ];

  const recentLeads = mockLeads.slice(0, 5);
  const recentOrders = mockOrders.slice(0, 5);
  const overdueInvoices = mockInvoices.filter(inv => inv.status === 'overdue');

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(stat.path)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                    <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>CRM Pipeline</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/crm')}>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.contact}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${lead.expectedRevenue.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lead.stage === 'won' ? 'bg-green-100 text-green-700' :
                      lead.stage === 'negotiation' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Orders</span>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/sales')}>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.total.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Invoices */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Overdue Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueInvoices.length > 0 ? (
              <div className="space-y-3">
                {overdueInvoices.map((inv) => (
                  <div key={inv.id} className="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <p className="font-medium text-sm">{inv.id}</p>
                      <p className="text-xs text-gray-600">{inv.customerName}</p>
                    </div>
                    <p className="font-bold text-red-600">${inv.balance.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No overdue invoices</p>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash Balance</span>
                <span className="font-semibold text-green-600">${accounting.cashBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receivables</span>
                <span className="font-semibold text-blue-600">${accounting.accountsReceivable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payables</span>
                <span className="font-semibold text-orange-600">${accounting.accountsPayable.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Net Income</span>
                <span className="font-bold text-lg">${accounting.netIncome.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">In Stock</span>
                <span className="font-bold text-green-600">{inventory.totalProducts - inventory.lowStock}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-900">Low Stock</span>
                <span className="font-bold text-red-600">{inventory.lowStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="font-semibold">${inventory.totalValue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { mockAccounts, mockJournalEntries, dashboardStats } from '../mockData';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

const Accounting = () => {
  const [accounts] = useState(mockAccounts);
  const [journalEntries] = useState(mockJournalEntries);
  const [searchTerm, setSearchTerm] = useState('');
  const { accounting } = dashboardStats;

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEntries = journalEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const accountsByType = {
    asset: accounts.filter(a => a.type === 'asset'),
    liability: accounts.filter(a => a.type === 'liability'),
    equity: accounts.filter(a => a.type === 'equity'),
    revenue: accounts.filter(a => a.type === 'revenue'),
    expense: accounts.filter(a => a.type === 'expense')
  };

  const totalAssets = accountsByType.asset.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accountsByType.liability.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accountsByType.equity.reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = accountsByType.revenue.reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accountsByType.expense.reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenue - totalExpenses;

  const getAccountTypeColor = (type) => {
    switch(type) {
      case 'asset': return 'bg-blue-100 text-blue-700';
      case 'liability': return 'bg-red-100 text-red-700';
      case 'equity': return 'bg-purple-100 text-purple-700';
      case 'revenue': return 'bg-green-100 text-green-700';
      case 'expense': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounting & Finance</h1>
          <p className="text-gray-600 mt-1">Track accounts and financial transactions</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Journal Entry
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Assets</div>
                <div className="text-2xl font-bold text-blue-600">${totalAssets.toLocaleString()}</div>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Liabilities</div>
                <div className="text-2xl font-bold text-red-600">${totalLiabilities.toLocaleString()}</div>
              </div>
              <TrendingDown className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Net Income</div>
                <div className="text-2xl font-bold text-purple-600">${netIncome.toLocaleString()}</div>
              </div>
              <PieChart className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Assets</h3>
              {accountsByType.asset.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">{acc.name}</span>
                  <span className="font-semibold text-blue-600">${acc.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-2 bg-blue-100 rounded font-bold">
                <span>Total Assets</span>
                <span className="text-blue-700">${totalAssets.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Liabilities</h3>
              {accountsByType.liability.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm">{acc.name}</span>
                  <span className="font-semibold text-red-600">${acc.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-2 bg-red-100 rounded font-bold">
                <span>Total Liabilities</span>
                <span className="text-red-700">${totalLiabilities.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Equity</h3>
              {accountsByType.equity.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">{acc.name}</span>
                  <span className="font-semibold text-purple-600">${acc.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-2 bg-purple-100 rounded font-bold">
                <span>Total Equity</span>
                <span className="text-purple-700">${totalEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search accounts or entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{account.code}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{account.name}</td>
                        <td className="px-6 py-4">
                          <Badge className={getAccountTypeColor(account.type)}>
                            {account.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">${account.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Entries Tab */}
        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">{entry.date}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{entry.reference}</td>
                        <td className="px-6 py-4 text-gray-900">{entry.description}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{entry.account}</td>
                        <td className="px-6 py-4">
                          {entry.debit > 0 && (
                            <span className="font-semibold text-green-600">${entry.debit.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {entry.credit > 0 && (
                            <span className="font-semibold text-red-600">${entry.credit.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-700">{entry.status.toUpperCase()}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Revenue</h4>
                    {accountsByType.revenue.map(acc => (
                      <div key={acc.id} className="flex justify-between text-sm py-1">
                        <span>{acc.name}</span>
                        <span className="font-semibold text-green-600">${acc.balance.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Revenue</span>
                      <span className="text-green-600">${totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Expenses</h4>
                    {accountsByType.expense.map(acc => (
                      <div key={acc.id} className="flex justify-between text-sm py-1">
                        <span>{acc.name}</span>
                        <span className="font-semibold text-red-600">${acc.balance.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Expenses</span>
                      <span className="text-red-600">${totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-t-2 border-green-600">
                    <span className="font-bold text-lg">Net Income</span>
                    <span className="font-bold text-xl text-green-600">${netIncome.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">Cash from Operations</div>
                    <div className="text-2xl font-bold text-green-600">$18,899.75</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Cash from Investing</div>
                    <div className="text-2xl font-bold text-blue-600">$5,000.00</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600">Cash from Financing</div>
                    <div className="text-2xl font-bold text-purple-600">$2,000.00</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-600">
                    <div className="text-sm text-gray-700 font-semibold">Net Cash Flow</div>
                    <div className="text-3xl font-bold text-green-700">${accounting.cashBalance.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accounting;
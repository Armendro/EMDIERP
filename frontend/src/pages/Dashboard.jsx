import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../utils/api';
import { TrendingUp, Users, ShoppingCart, Package, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { translate } from '../utils/translations';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return <div>Erro ao carregar dados</div>;

  const statCards = [
    { title: 'Receita Total', value: `R$ ${stats.sales.monthlyRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', change: '+12.5%', path: '/sales' },
    { title: 'Leads Ativos', value: stats.crm.activeLeads, icon: Users, color: 'from-blue-500 to-cyan-600', change: `${stats.crm.conversionRate}% conversão`, path: '/crm' },
    { title: 'Pedidos Pendentes', value: stats.sales.pendingApproval, icon: Clock, color: 'from-orange-500 to-amber-600', change: 'Precisam aprovação', path: '/sales' },
    { title: 'Produtos em Falta', value: stats.inventory.lowStock, icon: AlertTriangle, color: 'from-red-500 to-rose-600', change: 'Reposição necessária', path: '/inventory' }
  ];

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
              <span>Pipeline de Vendas</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total de Leads</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.crm.totalLeads}</span>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Leads Ganhos</span>
                  <span className="text-2xl font-bold text-green-600">{stats.crm.wonLeads}</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taxa de Conversão</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.crm.conversionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saldo em Caixa</span>
                <span className="font-semibold text-green-600">R$ {stats.accounting.cashBalance.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Contas a Receber</span>
                <span className="font-semibold text-blue-600">R$ {stats.accounting.accountsReceivable.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Contas a Pagar</span>
                <span className="font-semibold text-orange-600">R$ {stats.accounting.accountsPayable.toLocaleString('pt-BR')}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Lucro Líquido</span>
                <span className="font-bold text-lg">R$ {stats.accounting.netIncome.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Invoices */}
        {stats.overdueInvoices > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Faturas Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
              <p className="text-sm text-red-700 mt-2">Requerem atenção imediata</p>
            </CardContent>
          </Card>
        )}

        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Status do Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Em Estoque</span>
                <span className="font-bold text-green-600">{stats.inventory.totalProducts - stats.inventory.lowStock}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-900">Estoque Baixo</span>
                <span className="font-bold text-red-600">{stats.inventory.lowStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor Total</span>
                <span className="font-semibold">R$ {stats.inventory.totalValue.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Visão Geral de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Pedidos</span>
                <span className="font-semibold">{stats.sales.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor Médio</span>
                <span className="font-semibold">R$ {stats.sales.avgOrderValue.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-900">Aguardando Aprovação</span>
                <span className="font-bold text-yellow-600">{stats.sales.pendingApproval}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
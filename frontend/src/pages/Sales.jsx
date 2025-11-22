import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useOrders } from '../hooks/useOrders';
import { useInvoices } from '../hooks/useInvoices';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { translate } from '../utils/translations';

const Sales = () => {
  const { user } = useAuth();
  const { orders, loading, approveOrder, rejectOrder, createOrder } = useOrders();
  const { invoices } = useInvoices();
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state para novo pedido
  const [orderForm, setOrderForm] = useState({
    customer_id: '',
    customer_name: '',
    status: 'draft'
  });

  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'invoiced': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getInvoiceStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleApprove = async (orderId) => {
    const success = await approveOrder(orderId);
    if (success) {
      setIsDetailOpen(false);
    }
  };

  const handleReject = async (orderId) => {
    const success = await rejectOrder(orderId);
    if (success) {
      setIsDetailOpen(false);
    }
  };

  const addItemToOrder = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Verificar se produto já está no pedido
    const existingItemIndex = orderItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      // Atualizar quantidade
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity += parseInt(quantity);
      setOrderItems(newItems);
    } else {
      // Adicionar novo item
      setOrderItems([...orderItems, {
        product_id: product.id,
        product_name: product.name,
        quantity: parseInt(quantity),
        price: product.price
      }]);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItemFromOrder = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert('Adicione pelo menos um produto ao pedido');
      return;
    }

    if (!orderForm.customer_name) {
      alert('Digite o nome do cliente');
      return;
    }

    const orderData = {
      customer_id: orderForm.customer_id || 'CUST-' + Date.now(),
      customer_name: orderForm.customer_name,
      items: orderItems,
      status: orderForm.status
    };

    const success = await createOrder(orderData);
    
    if (success) {
      setIsCreateOpen(false);
      setOrderForm({ customer_id: '', customer_name: '', status: 'draft' });
      setOrderItems([]);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Vendas</h1>
          <p className="text-gray-600 mt-1">Gerencie pedidos e faturas</p>
        </div>
        
        {/* Dialog para criar novo pedido */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Pedido de Venda</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-6 py-4">
              {/* Informações do Cliente */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informações do Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Cliente *</Label>
                    <Input
                      placeholder="Digite o nome do cliente"
                      value={orderForm.customer_name}
                      onChange={(e) => setOrderForm({...orderForm, customer_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status do Pedido</Label>
                    <Select value={orderForm.status} onValueChange={(value) => setOrderForm({...orderForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="pending_approval">Enviar para Aprovação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Adicionar Produtos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Adicionar Produtos</h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-7 space-y-2">
                    <Label>Produto</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - R$ {product.price.toLocaleString('pt-BR')} (Estoque: {product.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <Button type="button" onClick={addItemToOrder} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de Itens do Pedido */}
              {orderItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Itens do Pedido</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">{item.product_name}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3">R$ {item.price.toLocaleString('pt-BR')}</td>
                            <td className="px-4 py-3 font-semibold">
                              R$ {(item.quantity * item.price).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeItemFromOrder(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-lg font-semibold">Total do Pedido:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {calculateTotal().toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={orderItems.length === 0}>
                  Criar Pedido
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-sm text-gray-600">Total de Pedidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending_approval').length}
            </div>
            <div className="text-sm text-gray-600">Aguardando Aprovação</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              R$ {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('pt-BR')}
            </div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {invoices.filter(i => i.status === 'overdue').length}
            </div>
            <div className="text-sm text-gray-600">Faturas Vencidas</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar pedidos ou faturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Pedidos de Venda</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                        <td className="px-6 py-4 text-gray-900">{order.customer_name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          R$ {order.total.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(order.status)}>
                            {translate('orderStatus', order.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Dialog open={isDetailOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                              setIsDetailOpen(open);
                              if (open) setSelectedOrder(order);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Pedido - {order.order_number}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm text-gray-600">Cliente</div>
                                      <div className="font-semibold">{order.customer_name}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-600">Data</div>
                                      <div className="font-semibold">
                                        {new Date(order.date).toLocaleDateString('pt-BR')}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 mb-2">Itens</div>
                                    <div className="border rounded-lg">
                                      <table className="w-full">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Produto</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Quantidade</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Preço</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                          {order.items.map((item, idx) => (
                                            <tr key={idx}>
                                              <td className="px-4 py-2">{item.product_name}</td>
                                              <td className="px-4 py-2">{item.quantity}</td>
                                              <td className="px-4 py-2">R$ {item.price.toLocaleString('pt-BR')}</td>
                                              <td className="px-4 py-2 font-semibold">
                                                R$ {(item.quantity * item.price).toLocaleString('pt-BR')}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="font-semibold">Valor Total</span>
                                    <span className="text-2xl font-bold text-green-600">
                                      R$ {order.total.toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                  {order.status === 'pending_approval' && (user.role === 'admin' || user.role === 'manager') && (
                                    <div className="flex gap-2">
                                      <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700" 
                                        onClick={() => handleApprove(order.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Aprovar Pedido
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        className="flex-1" 
                                        onClick={() => handleReject(order.id)}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rejeitar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            {order.status === 'pending_approval' && (user.role === 'admin' || user.role === 'manager') && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700" 
                                  onClick={() => handleApprove(order.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleReject(order.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoice_number}</td>
                        <td className="px-6 py-4 text-gray-900">{invoice.customer_name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(invoice.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          R$ {invoice.total.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-semibold text-red-600">
                          R$ {invoice.balance.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {translate('invoiceStatus', invoice.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;

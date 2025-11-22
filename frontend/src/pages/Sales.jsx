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
import { useContacts } from '../hooks/useContacts';
import { useStores } from '../hooks/useStores';
import { useCostCenters } from '../hooks/useCostCenters';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { translate } from '../utils/translations';

const Sales = () => {
  const { user } = useAuth();
  const { orders, loading, approveOrder, rejectOrder, createOrder } = useOrders();
  const { invoices } = useInvoices();
  const { products } = useProducts();
  const { contacts: customers } = useContacts(true, null);
  const { stores } = useStores();
  const { costCenters } = useCostCenters('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state para novo pedido
  const [orderForm, setOrderForm] = useState({
    customer_id: '',
    customer_name: '',
    store_id: '',
    cost_center_id: '',
    status: 'draft'
  });

  const [orderItems, setOrderItems] = useState([]);
  
  // States para adicionar item
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentCommissionPercent, setCurrentCommissionPercent] = useState(0);

  // Get available variants for selected product
  const getAvailableVariants = () => {
    if (!selectedProduct) return [];
    const product = products.find(p => p.id === selectedProduct);
    return product?.variants || [];
  };

  // Get available tiers for selected variant
  const getAvailableTiers = () => {
    if (!selectedProduct || !selectedVariant) return [];
    const product = products.find(p => p.id === selectedProduct);
    const variant = product?.variants?.find(v => v.variant_id === selectedVariant);
    return variant?.price_tiers || [];
  };

  // Update price and commission when tier is selected
  useEffect(() => {
    if (selectedProduct && selectedVariant && selectedTier) {
      const product = products.find(p => p.id === selectedProduct);
      const variant = product?.variants?.find(v => v.variant_id === selectedVariant);
      const tier = variant?.price_tiers?.find(t => t.name === selectedTier);
      
      if (tier) {
        setCurrentPrice(tier.price);
        setCurrentCommissionPercent(tier.commission_percent);
      }
    } else {
      setCurrentPrice(0);
      setCurrentCommissionPercent(0);
    }
  }, [selectedProduct, selectedVariant, selectedTier, products]);

  // Reset dependent fields when product changes
  useEffect(() => {
    setSelectedVariant('');
    setSelectedTier('');
    setCurrentPrice(0);
    setCurrentCommissionPercent(0);
  }, [selectedProduct]);

  // Reset tier when variant changes
  useEffect(() => {
    setSelectedTier('');
    setCurrentPrice(0);
    setCurrentCommissionPercent(0);
  }, [selectedVariant]);

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
    if (!selectedProduct || !selectedVariant || !selectedTier || quantity <= 0) {
      alert('Por favor, selecione produto, variante, tier de preço e quantidade válida');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    const variant = product?.variants?.find(v => v.variant_id === selectedVariant);
    
    if (!product || !variant) return;

    // Calcular valor da comissão
    const commissionValue = quantity * currentPrice * (currentCommissionPercent / 100);

    // Criar novo item
    const newItem = {
      product_id: product.id,
      product_name: product.name,
      variant_id: selectedVariant,
      variant_name: variant.name || `${variant.attributes?.map(a => a.value).join(' - ')}`,
      price_tier_name: selectedTier,
      quantity: parseInt(quantity),
      price: currentPrice,
      commission_percent: currentCommissionPercent,
      commission_value: commissionValue
    };

    setOrderItems([...orderItems, newItem]);

    // Reset form
    setSelectedProduct('');
    setSelectedVariant('');
    setSelectedTier('');
    setQuantity(1);
    setCurrentPrice(0);
    setCurrentCommissionPercent(0);
  };

  const removeItemFromOrder = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotalCommission = () => {
    return orderItems.reduce((sum, item) => sum + (item.commission_value || 0), 0);
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
      store_id: orderForm.store_id,
      cost_center_id: orderForm.cost_center_id,
      items: orderItems,
      status: orderForm.status
    };

    const success = await createOrder(orderData);
    
    if (success) {
      setIsCreateOpen(false);
      setOrderForm({ customer_id: '', customer_name: '', store_id: '', cost_center_id: '', status: 'draft' });
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Pedido de Venda</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-6 py-4">
              {/* Informações do Cliente */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informações do Pedido</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Selecionar Cliente *</Label>
                    <Select 
                      value={orderForm.customer_id} 
                      onValueChange={(value) => {
                        const customer = customers.find(c => c.id === value);
                        setOrderForm({
                          ...orderForm, 
                          customer_id: value,
                          customer_name: customer?.name || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.nif}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Loja *</Label>
                    <Select 
                      value={orderForm.store_id} 
                      onValueChange={(value) => setOrderForm({...orderForm, store_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.code} - {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Centro de Custo (Receita) *</Label>
                    <Select 
                      value={orderForm.cost_center_id} 
                      onValueChange={(value) => setOrderForm({...orderForm, cost_center_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um centro de custo" />
                      </SelectTrigger>
                      <SelectContent>
                        {costCenters.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.code} - {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              {/* Adicionar Produtos com Variantes e Tiers */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Adicionar Produtos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Linha 1: Produto */}
                  <div className="space-y-2">
                    <Label>1. Selecione o Produto *</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.category}
                            {product.variants?.length > 0 && ` (${product.variants.length} variantes)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Linha 2: Variante (só aparece se produto tem variantes) */}
                  {selectedProduct && getAvailableVariants().length > 0 && (
                    <div className="space-y-2">
                      <Label>2. Selecione a Variante *</Label>
                      <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma variante" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableVariants().map((variant) => (
                            <SelectItem key={variant.variant_id} value={variant.variant_id}>
                              {variant.name || variant.attributes?.map(a => `${a.name}: ${a.value}`).join(' | ')}
                              {` (Estoque: ${variant.stock || 0})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Linha 3: Tier de Preço */}
                  {selectedProduct && selectedVariant && getAvailableTiers().length > 0 && (
                    <div className="space-y-2">
                      <Label>3. Selecione o Tier de Preço *</Label>
                      <Select value={selectedTier} onValueChange={setSelectedTier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha o tier de preço" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableTiers().map((tier) => (
                            <SelectItem key={tier.name} value={tier.name}>
                              <div className="flex items-center justify-between w-full">
                                <span className="font-semibold uppercase">{tier.name}</span>
                                <span className="ml-4">
                                  R$ {tier.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                                  <span className="text-green-600 ml-2">(Comissão: {tier.commission_percent}%)</span>
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Linha 4: Informações de Preço e Quantidade */}
                  {selectedTier && (
                    <div className="grid grid-cols-12 gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs text-gray-600">Preço Unitário</Label>
                        <div className="text-xl font-bold text-blue-600">
                          R$ {currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs text-gray-600">Comissão</Label>
                        <div className="text-xl font-bold text-green-600">
                          {currentCommissionPercent}%
                        </div>
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label>Quantidade *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <Button type="button" onClick={addItemToOrder} className="w-full h-10">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variante</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão %</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">{item.product_name}</td>
                            <td className="px-4 py-3 text-sm">{item.variant_name}</td>
                            <td className="px-4 py-3">
                              <Badge className="uppercase">{item.price_tier_name}</Badge>
                            </td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-green-600 font-semibold">{item.commission_percent}%</td>
                            <td className="px-4 py-3 font-semibold">
                              R$ {(item.quantity * item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

                  {/* Totais */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-lg font-semibold">Subtotal do Pedido:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <span className="text-lg font-semibold text-green-700">Total de Comissão:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R$ {calculateTotalCommission().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
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
              R$ {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              R$ {orders.reduce((sum, o) => sum + (o.total_commission || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Comissão Total</div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
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
                          R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          R$ {(order.total_commission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                              <DialogContent className="max-w-4xl">
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
                                            <th className="px-4 py-2 text-left text-xs font-medium">Variante</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Tier</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Qtd</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Preço</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Comissão</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                          {order.items.map((item, idx) => (
                                            <tr key={idx}>
                                              <td className="px-4 py-2">{item.product_name}</td>
                                              <td className="px-4 py-2 text-sm">{item.variant_name || '-'}</td>
                                              <td className="px-4 py-2">
                                                {item.price_tier_name ? (
                                                  <Badge className="uppercase text-xs">{item.price_tier_name}</Badge>
                                                ) : '-'}
                                              </td>
                                              <td className="px-4 py-2">{item.quantity}</td>
                                              <td className="px-4 py-2">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                              <td className="px-4 py-2 text-green-600">
                                                {item.commission_percent ? `${item.commission_percent}%` : '-'}
                                              </td>
                                              <td className="px-4 py-2 font-semibold">
                                                R$ {(item.quantity * item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                      <span className="font-semibold">Valor Total</span>
                                      <span className="text-2xl font-bold text-blue-600">
                                        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                                      <span className="font-semibold text-green-700">Comissão Total</span>
                                      <span className="text-2xl font-bold text-green-600">
                                        R$ {(order.total_commission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
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
                          R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-red-600">
                          R$ {invoice.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

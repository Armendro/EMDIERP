import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useProducts } from '../hooks/useProducts';
import ProductForm from '../components/ProductForm';
import api from '../utils/api';
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const Inventory = () => {
  const { products, loading, createProduct, updateProduct } = useProducts();
  const [movements, setMovements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Carregar movimentações de estoque
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await api.get('/stock-movements');
        setMovements(response.data);
      } catch (error) {
        console.error('Erro ao carregar movimentações:', error);
      }
    };
    fetchMovements();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovements = movements.filter(movement =>
    movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock < p.reorder_level);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);

  const handleCreateProduct = async (productData) => {
    const success = await createProduct(productData);
    if (success) {
      setIsCreateOpen(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600 mt-1">Controle produtos e movimentações</p>
        </div>
        
        {/* Dialog para criar novo produto */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Produto *</Label>
                  <Input
                    placeholder="Ex: Notebook Dell Inspiron"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código SKU *</Label>
                  <Input
                    placeholder="Ex: PROD-001"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    placeholder="Ex: Eletrônicos"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    placeholder="Ex: Dell Brasil"
                    value={productForm.supplier}
                    onChange={(e) => setProductForm({...productForm, supplier: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva o produto..."
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Venda (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2999.90"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2000.00"
                    value={productForm.cost}
                    onChange={(e) => setProductForm({...productForm, cost: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estoque Inicial</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nível de Reposição</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={productForm.reorder_level}
                    onChange={(e) => setProductForm({...productForm, reorder_level: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Cadastrar Produto
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
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-gray-600">Total de Produtos</div>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
                <div className="text-sm text-gray-600">Estoque Baixo</div>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">R$ {totalInventoryValue.toLocaleString('pt-BR')}</div>
                <div className="text-sm text-gray-600">Valor do Estoque</div>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{movements.filter(m => m.type === 'in').length}</div>
                <div className="text-sm text-gray-600">Entradas</div>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Alerta de Estoque Baixo</h3>
                <p className="text-sm text-red-700">
                  {lowStockProducts.length} produto(s) precisam de reposição: {lowStockProducts.map(p => p.name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos ou movimentações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="movements">Movimentações de Estoque</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts.map((product) => {
                      const isLowStock = product.stock < product.reorder_level;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-600">{product.sku}</td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">{product.category}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                              {product.stock}
                            </div>
                            <div className="text-xs text-gray-500">Mín: {product.reorder_level}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">R$ {product.price.toLocaleString('pt-BR')}</td>
                          <td className="px-6 py-4 text-gray-600">R$ {product.cost.toLocaleString('pt-BR')}</td>
                          <td className="px-6 py-4">
                            {isLowStock ? (
                              <Badge className="bg-red-100 text-red-700">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Estoque Baixo
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">Em Estoque</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Local</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredMovements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(movement.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{movement.product_name}</td>
                        <td className="px-6 py-4">
                          {movement.type === 'in' ? (
                            <Badge className="bg-green-100 text-green-700">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              ENTRADA
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              SAÍDA
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{movement.reference}</td>
                        <td className="px-6 py-4 text-gray-600">{movement.location}</td>
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

export default Inventory;

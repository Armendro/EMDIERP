import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useStores } from '../hooks/useStores';
import { useCostCenters } from '../hooks/useCostCenters';
import api from '../utils/api';
import { Plus, Edit, Building, MapPin, Package } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Stores
  const { stores, loading: loadingStores } = useStores();
  const [allStores, setAllStores] = useState([]);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  
  // Cost Centers
  const { costCenters: revenueCCs } = useCostCenters('revenue');
  const [allCostCenters, setAllCostCenters] = useState([]);
  const [isCCDialogOpen, setIsCCDialogOpen] = useState(false);
  const [editingCC, setEditingCC] = useState(null);
  
  // Warehouses
  const [warehouses, setWarehouses] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSystemSettings(response.data);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Fetch all stores
  useEffect(() => {
    const fetchAllStores = async () => {
      try {
        const response = await api.get('/stores');
        setAllStores(response.data);
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
      }
    };
    fetchAllStores();
  }, []);

  // Fetch all cost centers
  useEffect(() => {
    const fetchAllCostCenters = async () => {
      try {
        const response = await api.get('/cost-centers');
        setAllCostCenters(response.data);
      } catch (error) {
        console.error('Erro ao carregar centros de custo:', error);
      }
    };
    fetchAllCostCenters();
  }, []);

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/warehouses');
        setWarehouses(response.data);
      } catch (error) {
        console.error('Erro ao carregar armazéns:', error);
      } finally {
        setLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, []);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', systemSettings);
      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      alert('Erro ao atualizar configurações');
    }
  };

  const handleSaveStore = async (storeData) => {
    try {
      if (editingStore) {
        await api.put(`/stores/${editingStore.id}`, storeData);
      } else {
        await api.post('/stores', storeData);
      }
      const response = await api.get('/stores');
      setAllStores(response.data);
      setIsStoreDialogOpen(false);
      setEditingStore(null);
    } catch (error) {
      console.error('Erro ao guardar loja:', error);
      alert(error.response?.data?.detail || 'Erro ao guardar loja');
    }
  };

  const handleSaveCostCenter = async (ccData) => {
    try {
      if (editingCC) {
        await api.put(`/cost-centers/${editingCC.id}`, ccData);
      } else {
        await api.post('/cost-centers', ccData);
      }
      const response = await api.get('/cost-centers');
      setAllCostCenters(response.data);
      setIsCCDialogOpen(false);
      setEditingCC(null);
    } catch (error) {
      console.error('Erro ao guardar centro de custo:', error);
      alert(error.response?.data?.detail || 'Erro ao guardar centro de custo');
    }
  };

  const handleSaveWarehouse = async (whData) => {
    try {
      if (editingWarehouse) {
        await api.put(`/warehouses/${editingWarehouse.id}`, whData);
      } else {
        await api.post('/warehouses', whData);
      }
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
      setIsWarehouseDialogOpen(false);
      setEditingWarehouse(null);
    } catch (error) {
      console.error('Erro ao guardar armazém:', error);
      alert(error.response?.data?.detail || 'Erro ao guardar armazém');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerir configuração do sistema</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="users">Utilizadores</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{user?.avatar}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <Badge className="mt-1 capitalize">{user?.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Utilizadores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Funcionalidade de gestão de utilizadores em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div>A carregar...</div>
              ) : (
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da empresa</Label>
                      <Input
                        value={systemSettings?.company_name || ''}
                        onChange={(e) => setSystemSettings({...systemSettings, company_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={systemSettings?.company_email || ''}
                        onChange={(e) => setSystemSettings({...systemSettings, company_email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={systemSettings?.company_phone || ''}
                        onChange={(e) => setSystemSettings({...systemSettings, company_phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={systemSettings?.company_website || ''}
                        onChange={(e) => setSystemSettings({...systemSettings, company_website: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Morada</Label>
                    <Input
                      value={systemSettings?.company_address || ''}
                      onChange={(e) => setSystemSettings({...systemSettings, company_address: e.target.value})}
                    />
                  </div>
                  <Button type="submit">Guardar alterações</Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* System Defaults */}
          <Card>
            <CardHeader>
              <CardTitle>Definições do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div>A carregar...</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Moeda padrão</Label>
                    <Select
                      value={systemSettings?.base_currency || 'EUR'}
                      onValueChange={(value) => setSystemSettings({...systemSettings, base_currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="USD">USD - Dólar</SelectItem>
                        <SelectItem value="GBP">GBP - Libra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuso horário</Label>
                    <Input
                      value={systemSettings?.timezone || ''}
                      onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lojas
              </CardTitle>
              <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingStore(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova loja
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingStore ? 'Editar' : 'Nova'} Loja</DialogTitle>
                  </DialogHeader>
                  <StoreForm
                    store={editingStore}
                    costCenters={revenueCCs}
                    onSave={handleSaveStore}
                    onCancel={() => {
                      setIsStoreDialogOpen(false);
                      setEditingStore(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allStores.map((store) => (
                    <tr key={store.id}>
                      <td className="px-4 py-2">{store.code}</td>
                      <td className="px-4 py-2">{store.name}</td>
                      <td className="px-4 py-2">{store.city}</td>
                      <td className="px-4 py-2">
                        <Badge className={store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {store.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingStore(store);
                            setIsStoreDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cost Centers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Centros de Custo</CardTitle>
              <Dialog open={isCCDialogOpen} onOpenChange={setIsCCDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingCC(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo centro de custo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCC ? 'Editar' : 'Novo'} Centro de Custo</DialogTitle>
                  </DialogHeader>
                  <CostCenterForm
                    costCenter={editingCC}
                    stores={allStores}
                    onSave={handleSaveCostCenter}
                    onCancel={() => {
                      setIsCCDialogOpen(false);
                      setEditingCC(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allCostCenters.map((cc) => (
                    <tr key={cc.id}>
                      <td className="px-4 py-2">{cc.code}</td>
                      <td className="px-4 py-2">{cc.name}</td>
                      <td className="px-4 py-2">
                        <Badge className={cc.type === 'revenue' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {cc.type === 'revenue' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Badge className={cc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {cc.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCC(cc);
                            setIsCCDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Warehouses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Armazéns
              </CardTitle>
              <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingWarehouse(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo armazém
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingWarehouse ? 'Editar' : 'Novo'} Armazém</DialogTitle>
                  </DialogHeader>
                  <WarehouseForm
                    warehouse={editingWarehouse}
                    stores={allStores}
                    onSave={handleSaveWarehouse}
                    onCancel={() => {
                      setIsWarehouseDialogOpen(false);
                      setEditingWarehouse(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {warehouses.map((wh) => {
                    const store = allStores.find(s => s.id === wh.store_id);
                    return (
                      <tr key={wh.id}>
                        <td className="px-4 py-2">{wh.code}</td>
                        <td className="px-4 py-2">{wh.name}</td>
                        <td className="px-4 py-2">{store?.name || '-'}</td>
                        <td className="px-4 py-2">
                          <Badge className={wh.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {wh.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingWarehouse(wh);
                              setIsWarehouseDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Store Form Component
const StoreForm = ({ store, costCenters, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    code: store?.code || '',
    name: store?.name || '',
    address_line1: store?.address_line1 || '',
    postal_code: store?.postal_code || '',
    city: store?.city || '',
    country: store?.country || 'Portugal',
    revenue_cost_center_id: store?.revenue_cost_center_id || '',
    status: store?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Código *</Label>
          <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label>Nome *</Label>
          <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Morada *</Label>
        <Input value={formData.address_line1} onChange={(e) => setFormData({...formData, address_line1: e.target.value})} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Código postal *</Label>
          <Input value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label>Cidade *</Label>
          <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label>País</Label>
          <Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Centro de custo (receita)</Label>
        <Select value={formData.revenue_cost_center_id} onValueChange={(value) => setFormData({...formData, revenue_cost_center_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um centro de custo" />
          </SelectTrigger>
          <SelectContent>
            {costCenters.map((cc) => (
              <SelectItem key={cc.id} value={cc.id}>{cc.code} - {cc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="inactive">Inativa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Guardar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
};

// Cost Center Form Component
const CostCenterForm = ({ costCenter, stores, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    code: costCenter?.code || '',
    name: costCenter?.name || '',
    type: costCenter?.type || 'revenue',
    store_id: costCenter?.store_id || '',
    status: costCenter?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Código *</Label>
        <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>Nome *</Label>
        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>Tipo *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.type === 'revenue' && (
        <div className="space-y-2">
          <Label>Loja (opcional)</Label>
          <Select value={formData.store_id} onValueChange={(value) => setFormData({...formData, store_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma loja" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>{store.code} - {store.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Guardar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
};

// Warehouse Form Component
const WarehouseForm = ({ warehouse, stores, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    code: warehouse?.code || '',
    name: warehouse?.name || '',
    store_id: warehouse?.store_id || '',
    status: warehouse?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Código *</Label>
        <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>Nome *</Label>
        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>Loja</Label>
        <Select value={formData.store_id} onValueChange={(value) => setFormData({...formData, store_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma loja" />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>{store.code} - {store.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Guardar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
};

export default Settings;

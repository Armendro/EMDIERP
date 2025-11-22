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
import api from '../utils/api';
import { Plus, Edit, Building, Users as UsersIcon, User as UserIcon } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  // Current user data
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Users management
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Stores
  const { stores } = useStores();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/users/me');
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Erro ao carregar utilizador:', error);
      } finally {
        setLoadingCurrentUser(false);
      }
    };
    fetchCurrentUser();
  }, []);

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

  // Fetch all users
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      const fetchUsers = async () => {
        try {
          const response = await api.get('/users');
          setUsers(response.data);
        } catch (error) {
          console.error('Erro ao carregar utilizadores:', error);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [user]);

  const handleUpdateProfile = async (profileData) => {
    try {
      await api.put(`/users/${currentUser.id}`, profileData);
      const response = await api.get('/users/me');
      setCurrentUser(response.data);
      setIsEditProfileOpen(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', systemSettings);
      const response = await api.get('/settings');
      setSystemSettings(response.data);
      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      alert('Erro ao atualizar configurações');
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, userData);
      } else {
        await api.post('/users', userData);
      }
      const response = await api.get('/users');
      setUsers(response.data);
      setIsUserDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao guardar utilizador:', error);
      alert(error.response?.data?.detail || 'Erro ao guardar utilizador');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Tem a certeza que deseja desativar este utilizador?')) return;
    try {
      await api.delete(`/users/${userId}`);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao desativar utilizador:', error);
      alert('Erro ao desativar utilizador');
    }
  };

  const getRoleName = (role) => {
    const roleNames = {
      admin: 'Administrador',
      manager: 'Gestor',
      employee: 'Funcionário'
    };
    return roleNames[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'employee': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerir configuração do sistema e utilizadores</p>
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informações do Perfil
                </CardTitle>
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>
                    {currentUser && (
                      <ProfileForm
                        user={currentUser}
                        stores={stores}
                        onSave={handleUpdateProfile}
                        onCancel={() => setIsEditProfileOpen(false)}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCurrentUser ? (
                <div>A carregar...</div>
              ) : currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{currentUser.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                      <p className="text-gray-600">{currentUser.email}</p>
                      <Badge className={`mt-1 ${getRoleBadgeColor(currentUser.role)}`}>
                        {getRoleName(currentUser.role)}
                      </Badge>
                    </div>
                  </div>
                  {currentUser.store_id && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm text-gray-600">Loja associada</Label>
                      <div className="text-gray-900 font-medium">
                        {stores.find(s => s.id === currentUser.store_id)?.name || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>Erro ao carregar perfil</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {(user?.role === 'admin' || user?.role === 'manager') ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Gestão de Utilizadores
                </CardTitle>
                {user?.role === 'admin' || user?.role === 'manager' && (
                  <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingUser(null)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo utilizador
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar' : 'Novo'} Utilizador</DialogTitle>
                      </DialogHeader>
                      <UserForm
                        user={editingUser}
                        stores={stores}
                        onSave={handleSaveUser}
                        onCancel={() => {
                          setIsUserDialogOpen(false);
                          setEditingUser(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div>A carregar...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          {user?.role === 'admin' && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map((u) => {
                          const userStore = stores.find(s => s.id === u.store_id);
                          return (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">{u.avatar}</span>
                                  </div>
                                  <span className="font-medium">{u.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{u.email}</td>
                              <td className="px-4 py-3">
                                <Badge className={getRoleBadgeColor(u.role)}>
                                  {getRoleName(u.role)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{userStore?.name || '-'}</td>
                              <td className="px-4 py-3">
                                <Badge className={u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {u.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </td>
                              {user?.role === 'admin' && (
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingUser(u);
                                        setIsUserDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {u.is_active && u.id !== currentUser?.id && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeactivateUser(u.id)}
                                      >
                                        Desativar
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Não tem permissão para gerir utilizadores.</p>
              </CardContent>
            </Card>
          )}
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
                  <Button type="submit">Guardar alterações</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Profile Form Component
const ProfileForm = ({ user, stores, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    store_id: user?.store_id || '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }
    onSave(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>E-mail *</Label>
        <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>Telefone</Label>
        <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Loja</Label>
        <Select value={formData.store_id} onValueChange={(value) => setFormData({...formData, store_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhuma</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>{store.code} - {store.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Nova palavra-passe (deixe vazio para não alterar)</Label>
        <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Guardar alterações</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
};

// User Form Component
const UserForm = ({ user, stores, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'employee',
    phone: user?.phone || '',
    store_id: user?.store_id || '',
    is_active: user?.is_active !== undefined ? user.is_active : true,
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (user && !submitData.password) {
      delete submitData.password;
    }
    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome *</Label>
        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>E-mail *</Label>
        <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>Função *</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="manager">Gestor</SelectItem>
            <SelectItem value="employee">Funcionário</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Telefone</Label>
        <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Loja</Label>
        <Select value={formData.store_id} onValueChange={(value) => setFormData({...formData, store_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhuma</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>{store.code} - {store.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(value) => setFormData({...formData, is_active: value === 'active'})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Palavra-passe {user ? '(deixe vazio para não alterar)' : '*'}</Label>
        <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!user} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Guardar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
};

export default Settings;

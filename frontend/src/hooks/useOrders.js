import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from '../components/ui/sonner';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      await api.post('/orders', orderData);
      toast.success('Pedido criado com sucesso!');
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao criar pedido');
      return false;
    }
  };

  const approveOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/approve`);
      toast.success('Pedido aprovado com sucesso!');
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error);
      toast.error(error.response?.data?.detail || 'Erro ao aprovar pedido');
      return false;
    }
  };

  const rejectOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/reject`);
      toast.success('Pedido rejeitado');
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error);
      toast.error('Erro ao rejeitar pedido');
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    createOrder,
    approveOrder,
    rejectOrder
  };
};
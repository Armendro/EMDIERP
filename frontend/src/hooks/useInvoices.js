import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from '../components/ui/sonner';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast.error('Erro ao carregar faturas');
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData) => {
    try {
      await api.post('/invoices', invoiceData);
      toast.success('Fatura criada com sucesso!');
      await fetchInvoices();
      return true;
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      toast.error('Erro ao criar fatura');
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice
  };
};
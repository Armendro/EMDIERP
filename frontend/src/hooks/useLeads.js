import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from '../components/ui/sonner';

export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData) => {
    try {
      await api.post('/leads', leadData);
      toast.success('Lead criado com sucesso!');
      await fetchLeads();
      return true;
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast.error('Erro ao criar lead');
      return false;
    }
  };

  const updateLead = async (leadId, leadData) => {
    try {
      await api.put(`/leads/${leadId}`, leadData);
      toast.success('Lead atualizado com sucesso!');
      await fetchLeads();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast.error('Erro ao atualizar lead');
      return false;
    }
  };

  const deleteLead = async (leadId) => {
    try {
      await api.delete(`/leads/${leadId}`);
      toast.success('Lead excluído com sucesso!');
      await fetchLeads();
      return true;
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast.error('Erro ao excluir lead');
      return false;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
};

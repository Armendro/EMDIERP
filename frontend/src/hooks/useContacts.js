import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useContacts = (isCustomer = null, isSupplier = null) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (isCustomer !== null) params.is_customer = isCustomer;
      if (isSupplier !== null) params.is_supplier = isSupplier;
      
      const response = await api.get('/contacts', { params });
      setContacts(response.data);
    } catch (error) {
      console.error('Erro ao carregar contactos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [isCustomer, isSupplier]);

  const createContact = async (contactData) => {
    try {
      await api.post('/contacts', contactData);
      await fetchContacts();
      return true;
    } catch (error) {
      console.error('Erro ao criar contacto:', error);
      alert(error.response?.data?.detail || 'Erro ao criar contacto');
      return false;
    }
  };

  const updateContact = async (id, contactData) => {
    try {
      await api.put(`/contacts/${id}`, contactData);
      await fetchContacts();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar contacto:', error);
      alert(error.response?.data?.detail || 'Erro ao atualizar contacto');
      return false;
    }
  };

  const deleteContact = async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      await fetchContacts();
      return true;
    } catch (error) {
      console.error('Erro ao eliminar contacto:', error);
      alert(error.response?.data?.detail || 'Erro ao eliminar contacto');
      return false;
    }
  };

  return {
    contacts,
    loading,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
};

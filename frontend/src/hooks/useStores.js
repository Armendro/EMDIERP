import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stores');
        setStores(response.data.filter(store => store.status === 'active'));
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return { stores, loading };
};

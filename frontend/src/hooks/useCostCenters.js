import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useCostCenters = (type = null) => {
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCostCenters = async () => {
      try {
        setLoading(true);
        const params = {};
        if (type) params.type = type;
        
        const response = await api.get('/cost-centers', { params });
        setCostCenters(response.data.filter(cc => cc.status === 'active'));
      } catch (error) {
        console.error('Erro ao carregar centros de custo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCostCenters();
  }, [type]);

  return { costCenters, loading };
};

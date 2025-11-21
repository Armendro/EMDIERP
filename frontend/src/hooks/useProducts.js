import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from '../components/ui/sonner';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      await api.post('/products', productData);
      toast.success('Produto criado com sucesso!');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
      return false;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      await api.put(`/products/${productId}`, productData);
      toast.success('Produto atualizado com sucesso!');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct
  };
};
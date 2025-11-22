import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, X } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';

const ProductForm = ({ onSubmit, onCancel }) => {
  const { contacts: suppliers } = useContacts(null, true);
  const [productData, setProductData] = useState({
    name: '',
    sku: '',
    category: '',
    family: '',
    sub_family: '',
    description: '',
    supplier: '',
    default_supplier_id: '',
    status: 'active',
    variants: []
  });

  const [currentVariant, setCurrentVariant] = useState({
    name: '',
    attributes: [],
    price_tiers: [],
    stock: 0
  });

  const [currentAttribute, setCurrentAttribute] = useState({ name: '', value: '' });
  const [currentPriceTier, setCurrentPriceTier] = useState({
    name: '',
    price: '',
    commission_percent: ''
  });

  // Adicionar atributo à variante atual
  const addAttribute = () => {
    if (!currentAttribute.name || !currentAttribute.value) {
      alert('Preencha nome e valor do atributo');
      return;
    }
    setCurrentVariant({
      ...currentVariant,
      attributes: [...currentVariant.attributes, currentAttribute]
    });
    setCurrentAttribute({ name: '', value: '' });
  };

  // Remover atributo
  const removeAttribute = (index) => {
    setCurrentVariant({
      ...currentVariant,
      attributes: currentVariant.attributes.filter((_, i) => i !== index)
    });
  };

  // Adicionar faixa de preço à variante atual
  const addPriceTier = () => {
    if (!currentPriceTier.name || !currentPriceTier.price || !currentPriceTier.commission_percent) {
      alert('Preencha todos os campos da faixa de preço');
      return;
    }
    setCurrentVariant({
      ...currentVariant,
      price_tiers: [
        ...currentVariant.price_tiers,
        {
          name: currentPriceTier.name,
          price: parseFloat(currentPriceTier.price),
          commission_percent: parseFloat(currentPriceTier.commission_percent)
        }
      ]
    });
    setCurrentPriceTier({ name: '', price: '', commission_percent: '' });
  };

  // Remover faixa de preço
  const removePriceTier = (index) => {
    setCurrentVariant({
      ...currentVariant,
      price_tiers: currentVariant.price_tiers.filter((_, i) => i !== index)
    });
  };

  // Adicionar variante ao produto
  const addVariantToProduct = () => {
    if (currentVariant.attributes.length === 0) {
      alert('Adicione pelo menos um atributo à variante');
      return;
    }
    if (currentVariant.price_tiers.length === 0) {
      alert('Adicione pelo menos uma faixa de preço à variante');
      return;
    }

    setProductData({
      ...productData,
      variants: [...productData.variants, currentVariant]
    });

    // Resetar variante atual
    setCurrentVariant({
      name: '',
      attributes: [],
      price_tiers: [],
      stock: 0
    });
  };

  // Remover variante do produto
  const removeVariant = (index) => {
    setProductData({
      ...productData,
      variants: productData.variants.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productData.name || !productData.sku) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Gerais do Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Gerais do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Produto *</Label>
              <Input
                placeholder="Ex: Colchão Premium"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Código SKU *</Label>
              <Input
                placeholder="Ex: COL-001"
                value={productData.sku}
                onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                placeholder="Ex: Móveis"
                value={productData.category}
                onChange={(e) => setProductData({ ...productData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Família</Label>
              <Input
                placeholder="Ex: Colchões"
                value={productData.family}
                onChange={(e) => setProductData({ ...productData, family: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subfamília</Label>
              <Input
                placeholder="Ex: Espuma"
                value={productData.sub_family}
                onChange={(e) => setProductData({ ...productData, sub_family: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fornecedor Padrão</Label>
              <Select 
                value={productData.default_supplier_id} 
                onValueChange={(value) => setProductData({ ...productData, default_supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={productData.status} onValueChange={(value) => setProductData({ ...productData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descreva o produto..."
              rows={3}
              value={productData.description}
              onChange={(e) => setProductData({ ...productData, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Variantes do Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Variantes do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Variantes já adicionadas */}
          {productData.variants.length > 0 && (
            <div className="space-y-2">
              <Label>Variantes Cadastradas:</Label>
              {productData.variants.map((variant, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{variant.name || `Variante ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">
                        {variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {variant.price_tiers.length} faixa(s) de preço | Estoque: {variant.stock}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulário para nova variante */}
          <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
            <h4 className="font-semibold">Nova Variante</h4>

            <div className="space-y-2">
              <Label>Nome da Variante (opcional)</Label>
              <Input
                placeholder="Ex: 140x190 - Bege"
                value={currentVariant.name}
                onChange={(e) => setCurrentVariant({ ...currentVariant, name: e.target.value })}
              />
            </div>

            {/* Atributos */}
            <div className="space-y-2">
              <Label>Atributos da Variante</Label>
              
              {/* Lista de atributos adicionados */}
              {currentVariant.attributes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentVariant.attributes.map((attr, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      <span className="text-sm">{attr.name}: {attr.value}</span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar novo atributo */}
              <div className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-4"
                  placeholder="Nome (ex: Tamanho)"
                  value={currentAttribute.name}
                  onChange={(e) => setCurrentAttribute({ ...currentAttribute, name: e.target.value })}
                />
                <Input
                  className="col-span-6"
                  placeholder="Valor (ex: 140x190)"
                  value={currentAttribute.value}
                  onChange={(e) => setCurrentAttribute({ ...currentAttribute, value: e.target.value })}
                />
                <Button type="button" onClick={addAttribute} className="col-span-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Faixas de Preço */}
            <div className="space-y-2">
              <Label>Faixas de Preço</Label>
              
              {/* Lista de faixas adicionadas */}
              {currentVariant.price_tiers.length > 0 && (
                <div className="space-y-2 mb-2">
                  {currentVariant.price_tiers.map((tier, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <span className="font-medium">{tier.name}</span>: R$ {tier.price.toLocaleString('pt-BR')} 
                        <span className="text-sm text-gray-600"> (Comissão: {tier.commission_percent}%)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePriceTier(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar nova faixa de preço */}
              <div className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-3"
                  placeholder="Nome (ex: normal)"
                  value={currentPriceTier.name}
                  onChange={(e) => setCurrentPriceTier({ ...currentPriceTier, name: e.target.value })}
                />
                <Input
                  className="col-span-3"
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  value={currentPriceTier.price}
                  onChange={(e) => setCurrentPriceTier({ ...currentPriceTier, price: e.target.value })}
                />
                <Input
                  className="col-span-4"
                  type="number"
                  step="0.01"
                  placeholder="Comissão %"
                  value={currentPriceTier.commission_percent}
                  onChange={(e) => setCurrentPriceTier({ ...currentPriceTier, commission_percent: e.target.value })}
                />
                <Button type="button" onClick={addPriceTier} className="col-span-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Estoque da variante */}
            <div className="space-y-2">
              <Label>Estoque Inicial</Label>
              <Input
                type="number"
                placeholder="0"
                value={currentVariant.stock}
                onChange={(e) => setCurrentVariant({ ...currentVariant, stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <Button
              type="button"
              onClick={addVariantToProduct}
              className="w-full"
              variant="outline"
            >
              Adicionar Variante ao Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Cadastrar Produto
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

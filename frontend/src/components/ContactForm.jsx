import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const ContactForm = ({ contact = null, onSubmit, onCancel, isCustomer = false, isSupplier = false }) => {
  const [formData, setFormData] = useState({
    is_customer: isCustomer,
    is_supplier: isSupplier,
    type: 'pessoa_coletiva',
    name: '',
    trade_name: '',
    nif: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    billing_address_line1: '',
    billing_postal_code: '',
    billing_city: '',
    billing_country: 'Portugal',
    shipping_same_as_billing: true,
    customer_type: '',
    payment_terms: '',
    credit_limit: '',
    supplier_type: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        is_customer: contact.is_customer,
        is_supplier: contact.is_supplier,
        type: contact.type,
        name: contact.name,
        trade_name: contact.trade_name || '',
        nif: contact.nif,
        email: contact.email,
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        website: contact.website || '',
        billing_address_line1: contact.billing_address_line1,
        billing_postal_code: contact.billing_postal_code,
        billing_city: contact.billing_city,
        billing_country: contact.billing_country,
        shipping_same_as_billing: contact.shipping_same_as_billing,
        customer_type: contact.customer_type || '',
        payment_terms: contact.payment_terms || '',
        credit_limit: contact.credit_limit || '',
        supplier_type: contact.supplier_type || '',
        status: contact.status,
        notes: contact.notes || ''
      });
    }
  }, [contact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null
    };
    
    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Informações Básicas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoa_singular">Pessoa Singular</SelectItem>
                <SelectItem value="pessoa_coletiva">Pessoa Coletiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>NIF *</Label>
            <Input
              value={formData.nif}
              onChange={(e) => handleChange('nif', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Nome Comercial</Label>
            <Input
              value={formData.trade_name}
              onChange={(e) => handleChange('trade_name', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contactos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Contactos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Telemóvel</Label>
            <Input
              value={formData.mobile}
              onChange={(e) => handleChange('mobile', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Morada de Faturação */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Morada de Faturação</h3>
        <div className="space-y-2">
          <Label>Morada *</Label>
          <Input
            value={formData.billing_address_line1}
            onChange={(e) => handleChange('billing_address_line1', e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Código Postal *</Label>
            <Input
              value={formData.billing_postal_code}
              onChange={(e) => handleChange('billing_postal_code', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade *</Label>
            <Input
              value={formData.billing_city}
              onChange={(e) => handleChange('billing_city', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>País</Label>
            <Input
              value={formData.billing_country}
              onChange={(e) => handleChange('billing_country', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Campos específicos de Cliente */}
      {isCustomer && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Informações de Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Cliente</Label>
              <Input
                value={formData.customer_type}
                onChange={(e) => handleChange('customer_type', e.target.value)}
                placeholder="Ex: Revendedor, Particular"
              />
            </div>
            <div className="space-y-2">
              <Label>Condições de Pagamento</Label>
              <Input
                value={formData.payment_terms}
                onChange={(e) => handleChange('payment_terms', e.target.value)}
                placeholder="Ex: 30 dias"
              />
            </div>
          </div>
        </div>
      )}

      {/* Campos específicos de Fornecedor */}
      {isSupplier && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Informações de Fornecedor</h3>
          <div className="space-y-2">
            <Label>Tipo de Fornecedor</Label>
            <Input
              value={formData.supplier_type}
              onChange={(e) => handleChange('supplier_type', e.target.value)}
              placeholder="Ex: Fabricante, Distribuidor"
            />
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          {contact ? 'Atualizar' : 'Criar'} {isCustomer ? 'Cliente' : 'Fornecedor'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;

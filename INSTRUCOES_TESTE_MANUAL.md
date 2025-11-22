# Instruções para Teste Manual - Sistema de Vendas com Variantes e Comissões

## Credenciais de Acesso
- **Email:** manager@erp.com
- **Senha:** Manager@123
- **Perfil:** Manager (pode aprovar pedidos)

---

## Fluxo de Teste Completo

### 1️⃣ Criar Produto com Variantes

1. Acesse: **Estoque** no menu lateral
2. Clique em **"+ Novo Produto"**
3. Preencha os dados básicos:
   - **Nome:** Colchão Confort Plus
   - **SKU:** COL-CONF-001
   - **Categoria:** Colchões
   - **Família:** Confort
   - **Subfamília:** Standard
   - **Fornecedor:** Fabricante XYZ

4. **Adicione Variantes:**
   
   **Variante 1:**
   - Nome: 140x190cm
   - Atributos: Tamanho = 140x190cm
   - Estoque: 20
   - **Tiers de Preço:**
     - NORMAL: R$ 1.200,00 | Comissão: 5%
     - SITE: R$ 1.080,00 | Comissão: 3%
     - PROMO: R$ 960,00 | Comissão: 2%
   
   **Variante 2:**
   - Nome: 160x200cm
   - Atributos: Tamanho = 160x200cm
   - Estoque: 15
   - **Tiers de Preço:**
     - NORMAL: R$ 1.500,00 | Comissão: 6%
     - SITE: R$ 1.350,00 | Comissão: 4%
     - PROMO: R$ 1.200,00 | Comissão: 3%

5. Clique em **"Criar Produto"**

---

### 2️⃣ Criar Pedido de Venda

1. Acesse: **Vendas** no menu lateral
2. Clique em **"+ Novo Pedido"**
3. Preencha:
   - **Nome do Cliente:** João da Silva Móveis
   - **Status:** Enviar para Aprovação

4. **Adicionar Produto - Item 1:**
   - **1. Selecione o Produto:** Colchão Confort Plus
   - **2. Selecione a Variante:** 140x190cm (Estoque: 20)
   - **3. Selecione o Tier:** NORMAL
   - ✅ **Verifique:** Preço Unit. = R$ 1.200,00 | Comissão = 5%
   - **Quantidade:** 2
   - Clique no botão **"+"** para adicionar

5. **Adicionar Produto - Item 2:**
   - **1. Selecione o Produto:** Colchão Confort Plus
   - **2. Selecione a Variante:** 160x200cm (Estoque: 15)
   - **3. Selecione o Tier:** PROMO
   - ✅ **Verifique:** Preço Unit. = R$ 1.200,00 | Comissão = 3%
   - **Quantidade:** 1
   - Clique no botão **"+"** para adicionar

6. **Verificar Totais:**
   - **Subtotal do Pedido:** R$ 3.600,00
     - (2 × R$ 1.200,00) + (1 × R$ 1.200,00)
   - **Total de Comissão:** R$ 156,00
     - Item 1: 2 × 1.200 × 5% = R$ 120,00
     - Item 2: 1 × 1.200 × 3% = R$ 36,00

7. Clique em **"Criar Pedido"**

---

### 3️⃣ Verificar Pedido Criado

1. Na lista de pedidos, localize o pedido recém-criado
2. **Verifique na tabela:**
   - Coluna **TOTAL:** R$ 3.600,00
   - Coluna **COMISSÃO:** R$ 156,00
   - Coluna **STATUS:** Aguardando Aprovação (amarelo)

3. Clique no ícone **👁️ (olho)** para ver detalhes
4. **No modal de detalhes, verifique:**
   - Tabela de itens mostrando:
     - Produto | Variante | Tier | Quantidade | Preço Unit. | Comissão %
   - **Valor Total:** R$ 3.600,00
   - **Comissão Total:** R$ 156,00

---

### 4️⃣ Aprovar Pedido (Workflow)

1. No modal de detalhes ou na lista, clique em **✓ Aprovar Pedido**
2. **O sistema deve:**
   - Deduzir estoque das variantes:
     - Variante 140x190cm: 20 → 18 unidades
     - Variante 160x200cm: 15 → 14 unidades
   - Criar lançamentos contábeis
   - Alterar status para **Aprovado**
   - Manter a comissão calculada: R$ 156,00

---

### 5️⃣ Verificar Dashboard

1. Volte para a página **Vendas**
2. **Verifique os cards de estatísticas:**
   - **Total de Pedidos:** Deve incluir o novo pedido
   - **Aguardando Aprovação:** Deve diminuir após aprovação
   - **Valor Total:** Soma de todos os pedidos
   - **Comissão Total:** R$ 156,00 + comissões de outros pedidos

---

## ✅ Checklist de Validação

- [ ] Produto com variantes foi criado com sucesso
- [ ] Cada variante tem 3 tiers (normal, site, promo)
- [ ] Cada tier tem preço e percentual de comissão
- [ ] Ao selecionar tier, preço e comissão preenchem automaticamente
- [ ] Tabela de itens do pedido mostra todas as informações
- [ ] Subtotal do pedido está correto
- [ ] **Total de comissão está calculado corretamente**
- [ ] Pedido salvo no banco com `total_commission`
- [ ] Lista de pedidos mostra coluna de comissão
- [ ] Detalhes do pedido mostram comissão por item e total
- [ ] Aprovação deduz estoque da variante correta
- [ ] Dashboard mostra comissão total acumulada

---

## 📊 Exemplos de Cálculo

### Exemplo 1:
- 3 unidades × R$ 1.500 (tier normal) × 6% = R$ 270,00 de comissão

### Exemplo 2:
- 1 unidade × R$ 1.080 (tier site) × 3% = R$ 32,40 de comissão

### Exemplo 3 (Pedido Misto):
- Item A: 2 × R$ 1.200 × 5% = R$ 120,00
- Item B: 1 × R$ 1.200 × 3% = R$ 36,00
- **Total Comissão:** R$ 156,00

---

## 🐛 Problemas Conhecidos

Se encontrar algum erro, verifique:
1. Backend está rodando: `sudo supervisorctl status backend`
2. Logs de erro: `tail -50 /var/log/supervisor/backend.err.log`
3. Se o produto tem variantes configuradas
4. Se todos os 3 tiers estão presentes (normal, site, promo)

---

## 📝 Notas Técnicas

**Estrutura de Dados Implementada:**

```javascript
// Linha do Pedido
{
  product_id: "...",
  product_name: "Colchão Premium",
  variant_id: "VAR-001-...",
  variant_name: "140x190cm",
  price_tier_name: "normal",
  quantity: 2,
  price: 1500.00,
  commission_percent: 5.0,
  commission_value: 150.00  // Calculado: 2 × 1500 × 5%
}

// Pedido
{
  total: 3000.00,
  total_commission: 150.00,
  items: [...]
}
```

---

**Fim das Instruções**

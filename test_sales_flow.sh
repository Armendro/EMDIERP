#!/bin/bash

BACKEND_URL="https://bizmanager-72.preview.emergentagent.com/api"

echo "=== TESTE DO FLUXO DE VENDAS COM VARIANTES E COMISSÕES ==="
echo ""

# 1. Login
echo "1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao fazer login"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✓ Login bem-sucedido"
echo ""

# 2. Criar produto com variantes
echo "2. Criando produto com variantes e tiers de preço..."
PRODUCT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Colchão Premium",
    "sku": "COL-PREM-001",
    "category": "Colchões",
    "family": "Premium",
    "sub_family": "Ortopédico",
    "supplier": "Fornecedor ABC",
    "description": "Colchão ortopédico premium",
    "status": "active",
    "variants": [
      {
        "name": "140x190",
        "attributes": [
          {"name": "Tamanho", "value": "140x190"}
        ],
        "stock": 10,
        "price_tiers": [
          {"name": "normal", "price": 1500.00, "commission_percent": 5.0},
          {"name": "site", "price": 1350.00, "commission_percent": 3.0},
          {"name": "promo", "price": 1200.00, "commission_percent": 2.0}
        ]
      },
      {
        "name": "160x200",
        "attributes": [
          {"name": "Tamanho", "value": "160x200"}
        ],
        "stock": 8,
        "price_tiers": [
          {"name": "normal", "price": 1800.00, "commission_percent": 6.0},
          {"name": "site", "price": 1620.00, "commission_percent": 4.0},
          {"name": "promo", "price": 1440.00, "commission_percent": 3.0}
        ]
      }
    ]
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"product_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$PRODUCT_ID" ]; then
  echo "❌ Erro ao criar produto"
  echo $PRODUCT_RESPONSE
  exit 1
fi

echo "✓ Produto criado com ID: $PRODUCT_ID"
echo ""

# 3. Buscar produto para obter variant_id
echo "3. Buscando detalhes do produto..."
PRODUCT_DETAILS=$(curl -s -X GET "$BACKEND_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Produto: $(echo $PRODUCT_DETAILS | jq -r '.name')"
echo "Variantes disponíveis:"
echo "$PRODUCT_DETAILS" | jq -r '.variants[] | "  - \(.name): \(.variant_id)"'
echo ""

# Extrair variant_id da primeira variante
VARIANT_ID_1=$(echo $PRODUCT_DETAILS | jq -r '.variants[0].variant_id')
VARIANT_ID_2=$(echo $PRODUCT_DETAILS | jq -r '.variants[1].variant_id')

echo "✓ Variantes identificadas"
echo "  Variante 1 ID: $VARIANT_ID_1"
echo "  Variante 2 ID: $VARIANT_ID_2"
echo ""

# 4. Criar pedido de venda com variantes
echo "4. Criando pedido de venda com seleção de variantes e tiers..."
ORDER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"customer_id\": \"CUST-TEST-001\",
    \"customer_name\": \"Cliente Teste\",
    \"status\": \"pending_approval\",
    \"items\": [
      {
        \"product_id\": \"$PRODUCT_ID\",
        \"product_name\": \"Colchão Premium\",
        \"variant_id\": \"$VARIANT_ID_1\",
        \"variant_name\": \"140x190\",
        \"price_tier_name\": \"normal\",
        \"quantity\": 2,
        \"price\": 1500.00,
        \"commission_percent\": 5.0,
        \"commission_value\": 150.00
      },
      {
        \"product_id\": \"$PRODUCT_ID\",
        \"product_name\": \"Colchão Premium\",
        \"variant_id\": \"$VARIANT_ID_2\",
        \"variant_name\": \"160x200\",
        \"price_tier_name\": \"promo\",
        \"quantity\": 1,
        \"price\": 1440.00,
        \"commission_percent\": 3.0,
        \"commission_value\": 43.20
      }
    ]
  }")

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"order_id":"[^"]*' | cut -d'"' -f4)
ORDER_NUMBER=$(echo $ORDER_RESPONSE | grep -o '"order_number":"[^"]*' | cut -d'"' -f4)
TOTAL_COMMISSION=$(echo $ORDER_RESPONSE | grep -o '"total_commission":[0-9.]*' | cut -d':' -f2)

if [ -z "$ORDER_ID" ]; then
  echo "❌ Erro ao criar pedido"
  echo $ORDER_RESPONSE
  exit 1
fi

echo "✓ Pedido criado!"
echo "  Número do Pedido: $ORDER_NUMBER"
echo "  ID do Pedido: $ORDER_ID"
echo "  Comissão Total: R$ $TOTAL_COMMISSION"
echo ""

# 5. Buscar detalhes do pedido
echo "5. Buscando detalhes do pedido..."
ORDER_DETAILS=$(curl -s -X GET "$BACKEND_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Pedido $ORDER_NUMBER:"
echo "  Cliente: $(echo $ORDER_DETAILS | jq -r '.customer_name')"
echo "  Total: R$ $(echo $ORDER_DETAILS | jq -r '.total')"
echo "  Comissão Total: R$ $(echo $ORDER_DETAILS | jq -r '.total_commission')"
echo "  Status: $(echo $ORDER_DETAILS | jq -r '.status')"
echo ""
echo "Itens do pedido:"
echo "$ORDER_DETAILS" | jq -r '.items[] | "  - \(.product_name) [\(.variant_name)] - Tier: \(.price_tier_name) - Qtd: \(.quantity) - Preço: R$ \(.price) - Comissão: \(.commission_percent)%"'
echo ""

echo "=== TESTE CONCLUÍDO COM SUCESSO! ==="

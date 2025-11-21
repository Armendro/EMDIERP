# Sistema ERP Completo

Sistema ERP (Enterprise Resource Planning) completo desenvolvido com React, FastAPI e MongoDB, totalmente em português brasileiro.

## 📋 Sobre o Projeto

Este é um sistema ERP moderno e completo que oferece gerenciamento integrado de:
- **CRM** - Gestão de leads e oportunidades com pipeline de vendas
- **Vendas** - Pedidos, aprovações e faturamento
- **Estoque** - Controle de produtos e movimentações
- **Financeiro** - Contabilidade, contas a pagar/receber e relatórios

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** - Framework JavaScript
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes UI modernos
- **Axios** - Cliente HTTP
- **React Router** - Navegação

### Backend
- **FastAPI** - Framework Python de alta performance
- **MongoDB** - Banco de dados NoSQL
- **Motor** - Driver assíncrono do MongoDB
- **JWT** - Autenticação e autorização
- **Passlib + Bcrypt** - Criptografia de senhas

## 📦 Requisitos

- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB** >= 5.x
- **Yarn** (gerenciador de pacotes)

## 🔧 Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd app
```

### 2. Configuração do Backend

#### 2.1. Criar ambiente virtual Python

```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

#### 2.2. Instalar dependências

```bash
pip install -r requirements.txt
```

#### 2.3. Configurar variáveis de ambiente

Crie o arquivo `.env` na pasta `backend`:

```bash
# backend/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=erp_database
JWT_SECRET_KEY=sua-chave-secreta-aqui-mude-em-producao
```

#### 2.4. Popular o banco de dados

Execute o script de seed para criar dados iniciais:

```bash
python seed_data.py
```

Isso criará:
- 3 usuários (Admin, Gerente, Funcionário)
- 5 leads no CRM
- 5 produtos
- 5 pedidos de venda
- 3 faturas
- 8 contas contábeis
- Lançamentos contábeis de exemplo

### 3. Configuração do Frontend

#### 3.1. Instalar dependências

```bash
cd ../frontend
yarn install
```

#### 3.2. Configurar variáveis de ambiente

O arquivo `.env` já existe em `frontend/.env`:

```bash
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**⚠️ IMPORTANTE:** NÃO modifique a URL do backend no .env

## ▶️ Como Rodar

### Opção 1: Usando Supervisor (Recomendado)

Se estiver em um ambiente com supervisor configurado:

```bash
# Iniciar todos os serviços
sudo supervisorctl start all

# Verificar status
sudo supervisorctl status

# Reiniciar serviços
sudo supervisorctl restart all
```

### Opção 2: Manualmente

#### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # No Windows: venv\Scripts\activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Terminal 2 - Frontend

```bash
cd frontend
yarn start
```

#### Terminal 3 - MongoDB

Se o MongoDB não estiver rodando como serviço:

```bash
mongod --dbpath /caminho/para/data/db
```

## 🌐 Acessar o Sistema

Após iniciar os serviços:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **Documentação da API:** http://localhost:8001/docs

## 🔐 Credenciais de Acesso

### Usuários Padrão

| Tipo | Email | Senha | Permissões |
|------|-------|-------|------------|
| **Administrador** | admin@erp.com | password123 | Acesso total ao sistema |
| **Gerente** | sarah@erp.com | password123 | Aprovar pedidos, relatórios |
| **Funcionário** | john@erp.com | password123 | Acesso limitado |

## 📁 Estrutura do Projeto

```
app/
├── backend/                 # API FastAPI
│   ├── auth/               # Autenticação JWT
│   ├── models/            # Modelos Pydantic
│   ├── routes/            # Endpoints da API
│   ├── database.py        # Conexão MongoDB
│   ├── server.py          # Aplicação principal
│   ├── seed_data.py       # Script de seed
│   └── requirements.txt   # Dependências Python
│
├── frontend/              # Aplicação React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/       # Páginas do sistema
│   │   ├── context/     # Context API
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utilitários
│   └── package.json
│
└── README.md            # Este arquivo
```

## ✨ Funcionalidades

### 🎯 CRM (Gestão de Leads)
- ✅ Criar, editar e deletar leads
- ✅ Kanban board com 6 estágios (Novo → Ganho/Perdido)
- ✅ Priorização (Alta, Média, Baixa)
- ✅ Rastreamento de receita esperada
- ✅ Atribuição de responsáveis

### 🛒 Vendas
- ✅ Criação de pedidos de venda
- ✅ Workflow de aprovação (Admin/Gerente)
- ✅ Dedução automática de estoque ao aprovar
- ✅ Geração de faturas
- ✅ Controle de status (Rascunho → Concluído)
- ✅ Lançamentos contábeis automáticos

### 📦 Estoque
- ✅ Cadastro de produtos
- ✅ Controle de estoque em tempo real
- ✅ Alertas de estoque baixo
- ✅ Registro de movimentações (entrada/saída)
- ✅ Múltiplas categorias

### 💰 Financeiro
- ✅ Plano de contas
- ✅ Lançamentos contábeis
- ✅ Contas a pagar e receber
- ✅ Relatórios financeiros (Balanço, DRE)
- ✅ Fluxo de caixa

### 📊 Dashboard
- ✅ Estatísticas em tempo real
- ✅ Indicadores chave de performance
- ✅ Alertas e notificações
- ✅ Visão geral de todos os módulos

### 🔒 Segurança
- ✅ Autenticação JWT
- ✅ Senhas criptografadas (bcrypt)
- ✅ Controle de acesso baseado em roles
- ✅ Rotas protegidas no frontend e backend

## 🔌 API Endpoints Principais

- `POST /api/auth/login` - Login
- `GET /api/leads` - Listar leads
- `POST /api/leads` - Criar lead
- `GET /api/orders` - Listar pedidos
- `PUT /api/orders/{id}/approve` - Aprovar pedido ⚡
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/dashboard/stats` - Estatísticas

**📖 Documentação completa:** http://localhost:8001/docs

## 🔄 Workflow de Aprovação de Pedidos

Quando um pedido é **aprovado** pelo Admin ou Gerente:

1. ✅ Status muda para "Aprovado"
2. ✅ Estoque é deduzido automaticamente
3. ✅ Movimentação de estoque é registrada
4. ✅ Lançamentos contábeis são criados

## 🐛 Solução de Problemas

### Backend não inicia

```bash
# Verificar logs
tail -f /var/log/supervisor/backend.err.log

# Verificar MongoDB
sudo systemctl status mongod
```

### Frontend não compila

```bash
# Reinstalar dependências
rm -rf node_modules
yarn install
```

### Resetar Banco de Dados

```bash
cd backend
python seed_data.py
```

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ usando React, FastAPI e MongoDB**

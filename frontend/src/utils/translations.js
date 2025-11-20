// Traduções do sistema

export const translations = {
  // Status de Pedidos
  orderStatus: {
    draft: 'Rascunho',
    pending_approval: 'Aguardando Aprovação',
    approved: 'Aprovado',
    invoiced: 'Faturado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  },

  // Status de Faturas
  invoiceStatus: {
    draft: 'Rascunho',
    sent: 'Enviado',
    paid: 'Pago',
    overdue: 'Vencido'
  },

  // Estágios do CRM
  crmStages: {
    new: 'Novo',
    qualified: 'Qualificado',
    proposition: 'Proposta',
    negotiation: 'Negociação',
    won: 'Ganho',
    lost: 'Perdido'
  },

  // Prioridades
  priority: {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  },

  // Tipos de Movimentação
  movementType: {
    in: 'Entrada',
    out: 'Saída'
  },

  // Tipos de Conta
  accountType: {
    asset: 'Ativo',
    liability: 'Passivo',
    equity: 'Patrimônio Líquido',
    revenue: 'Receita',
    expense: 'Despesa'
  },

  // Roles
  roles: {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Funcionário'
  }
};

export const translate = (category, key) => {
  return translations[category]?.[key] || key;
};
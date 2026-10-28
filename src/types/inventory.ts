export interface SaldoProdutoLote {
  produto: string;
  lote: string;
  ano: string;
  total_qtd_plt: number;
  total_qtd_pct: number;
  total_produzido: number;
  total_saida: number;
  saldo: number;
}

export interface InventorySummary {
  totalPaletes: number;
  totalPacotes: number;
  totalProduzido: number;
  totalSaida: number;
  totalSaldo: number;
  totalLotes: number;
}

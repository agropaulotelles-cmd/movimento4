export interface CargoItem {
  id: string;
  sku: string;
  descricao: string;
  categoria: string;
  paletes: number;
  pacotes: number;
  unidades: number;
  pesoKg: number;
  notaFiscal: string;
  destinatario: string;
  cidadeUf: string;
}

export interface DispatchMovement {
  id: number; // e.g. 3863
  formattedId: string; // e.g. "3.863"
  motorista: string;
  placa: string;
  dataHora: string; // ISO string or format
  dataHoraFormatada: string; // e.g. "27/10/2026 · 17:10"
  totalPaletes: number;
  totalPacotes: number;
  totalUnidades: number;
  pesoTotalKg: number;
  status: 'concluido' | 'em_transito' | 'carregando' | 'conferido';
  doca: string;
  conferente: string;
  transportadora: string;
  itens: CargoItem[];
  numeroLacre?: string;
}

export interface FilterState {
  search: string;
  motorista: string; // 'todos' or driver name
  placa: string; // '' or plate
  produto?: string;
  lote?: string;
  periodo: 'tudo' | 'hoje' | '7dias' | '30dias' | 'custom';
  dataInicio?: string;
  dataFim?: string;
  minPaletes?: number;
  maxPaletes?: number;
  minPacotes?: number;
  maxPacotes?: number;
  minUnidades?: number;
  maxUnidades?: number;
}

export type SortField =
  | 'id'
  | 'motorista'
  | 'placa'
  | 'dataHora'
  | 'totalPaletes'
  | 'totalPacotes'
  | 'totalUnidades';

export type SortOrder = 'asc' | 'desc';

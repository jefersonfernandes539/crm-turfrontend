export type VoucherItem = {
  descricao: string;
  data?: string; // YYYY-MM-DD
  hora?: string; // HH:mm
  observacoes?: string;
};

export type VoucherPassenger = {
  nome: string;
  telefone?: string;
  colo: boolean;
};

export type VoucherFormData = {
  codigo: string;
  contratante: string;
  telefone?: string;
  embarque?: string;
  operadora?: string; // operador.id
  vendedor?: string; // seller.name
  itens: VoucherItem[];
  passageiros: VoucherPassenger[];
  total?: number;
  entrada?: number;
  restante?: number;
  observacoes?: string;
};

export interface Operator {
  id: string;
  name: string;
}

export interface PricebookItem {
  name: string;
  net: number;
}
export type VoucherDB = {
  id: string;
  codigo: string;
  reserva_id?: string;
  vendedor_id?: string;
  cliente_nome: string;
  telefone?: string;
  hotel?: string;
  valor_total_centavos?: number;
  entrada_centavos?: number;
  restante_centavos?: number;
  obs?: string;
  status?: string; // 'EMITIDO' | outro
  emitido_em?: string;
  pdf_filename?: string;
  pdf_url?: string;
  created_at?: string;
  operator_name?: string;
  seller_name?: string;
  issued_at?: string;
  payload?: any; // VoucherFormData
};

export interface VoucherPayload {
  codigo?: string;
  contratante?: string;
  [key: string]: any;
}

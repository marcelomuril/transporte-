export interface Aluno {
  id: number;
  nome: string;
  rota: string;
}

export interface Viagem {
  id: number;
  tipo: 'Ida' | 'Volta';
  data: string;
  status: 'Em Andamento' | 'Finalizada';
}

export interface Log {
  id: number;
  viagem_id: number;
  aluno_id: number;
  status: 'Embarcou' | 'Não Embarcou' | 'Desembarcou';
  data_hora: string;
  aluno_nome?: string;
  rota?: string;
}
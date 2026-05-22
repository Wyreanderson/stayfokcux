export type Prioridade = "critica" | "alta" | "media" | "baixa";
export type Status =
  | "agora"
  | "em_breve"
  | "pode_esperar"
  | "em_pausa"
  | "concluida";
export type Fonte = "texto" | "audio";

export type Categoria = {
  id: string;
  nome: string;
  icone: string | null;
  cor: string | null;
};

export type Tarefa = {
  id: string;
  usuario_id: string;
  descricao: string;
  descricao_resumida: string | null;
  categoria_id: string | null;
  categoria?: Categoria | null;
  prioridade: Prioridade;
  prazo: string | null;
  interruptivel: boolean;
  status: Status;
  recorrencia: number;
  motivacao: string | null;
  sugestao_horario: string | null;
  palavras_chave: string[] | null;
  notas: string | null;
  fonte: Fonte;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
};

export type HistoricoItem = {
  id: string;
  tarefa_id: string;
  acao: string;
  data_hora: string;
};

export type PadraoUsuario = {
  id: string;
  usuario_id: string;
  padrao: string;
  frequencia: number;
  ultima_ocorrencia: string;
};

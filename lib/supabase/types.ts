export type Prioridade = "critica" | "alta" | "media" | "baixa";
export type Status =
  | "agora"
  | "em_breve"
  | "pode_esperar"
  | "em_pausa"
  | "concluida"
  | "recusada";
export type Fonte = "texto" | "audio";
export type Role = "super_admin" | "patrao" | "colaborador";

export type Usuario = {
  id: string;
  nome: string;
  email: string | null;
  role: Role;
  patrao_id: string | null;
  username: string | null;
  senha_hash: string | null;
  codigo_acesso: string | null;
  created_at: string;
};

export type Convite = {
  id: string;
  token: string;
  patrao_id: string;
  nome_sugerido: string | null;
  criado_em: string;
  expira_em: string | null;
  usado_em: string | null;
  usuario_criado_id: string | null;
};

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
  resumo_atual: string | null;
  solicitante_id: string | null;
  solicitante?: { id: string; nome: string; username: string | null } | null;
  recusada_motivo: string | null;
  created_at: string;
  updated_at: string;
};

export type AtualizacaoTarefa = {
  id: string;
  tarefa_id: string;
  fonte: Fonte;
  conteudo_original: string;
  resumo_acao: string;
  audio_url: string | null;
  status_anterior: Status | null;
  status_novo: Status | null;
  razao_mudanca: string | null;
  created_at: string;
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

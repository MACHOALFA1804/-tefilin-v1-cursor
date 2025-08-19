import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://oghibmokjwoeyywkgpcc.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naGlibW9randvZXl5d2tncGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjU0NTUsImV4cCI6MjA3MTEwMTQ1NX0.gmDD_yT96LplAH2BSbxwsy8gnVghREvvJ4m1KkB983s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces para o banco de dados
export interface VisitanteRow {
  id?: string;
  nome?: string;
  telefone?: string;
  tipo?: 'Cristão' | 'Não Cristão' | 'Pregador' | 'Outro';
  status?: 'Aguardando' | 'Aguardando Visita' | 'Visitado' | 'Novo Membro' | 'Pendente';
  quem_acompanha?: string;
  congregacao_origem?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileRow {
  id?: string;
  user_id?: string;
  role?: 'admin' | 'pastor' | 'recepcionista';
  nome?: string;
  email?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VisitaRow {
  id?: string;
  visitante_id?: string;
  pastor_id?: string;
  data_agendada?: string;
  data_realizada?: string;
  tipo_visita?: 'Presencial' | 'Telefone' | 'WhatsApp' | 'Outro';
  status?: 'Agendada' | 'Realizada' | 'Cancelada' | 'Reagendada';
  observacoes?: string;
  requer_acompanhamento?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MensagemRow {
  id?: string;
  visitante_id?: string;
  usuario_id?: string;
  template_usado?: string;
  conteudo?: string;
  data_envio?: string;
  status_envio?: 'Enviada' | 'Falhada' | 'Pendente';
  whatsapp_message_id?: string;
  created_at?: string;
}

export interface ConfiguracaoRow {
  id?: string;
  chave?: string;
  valor?: string;
  descricao?: string;
  categoria?: 'sistema' | 'igreja' | 'whatsapp' | 'email' | 'pdf';
  created_at?: string;
  updated_at?: string;
}

export interface LoginAttemptRow {
  id?: string;
  email?: string;
  tentativas?: number;
  bloqueado_ate?: string;
  ip_address?: string;
  created_at?: string;
  updated_at?: string;
}




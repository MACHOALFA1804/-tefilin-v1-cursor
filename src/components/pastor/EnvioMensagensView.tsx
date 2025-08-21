import React, { useState, useEffect } from 'react';
import { supabase, VisitanteRow, MensagemRow } from '../../lib/supabaseClient';
import { useWhatsApp, churchTemplates } from '../../services/whatsappService';

interface EnvioMensagensViewProps {
  onBack: () => void;
}

interface Template {
  id: string;
  nome: string;
  conteudo: string;
  categoria: 'boas-vindas' | 'visita' | 'acompanhamento' | 'convite' | 'personalizada';
}

const templates: Template[] = [
  {
    id: '1',
    nome: 'Boas-vindas Cristão',
    categoria: 'boas-vindas',
    conteudo: 'Olá {nome}, paz do Senhor! Obrigado por nos visitar na Assembleia de Deus Vila Evangélica. Foi uma alegria ter você conosco! Esperamos vê-lo novamente em breve. Deus abençoe! 🙏'
  },
  {
    id: '2',
    nome: 'Boas-vindas Não Cristão',
    categoria: 'boas-vindas',
    conteudo: 'Olá {nome}! Muito obrigado por nos visitar na Assembleia de Deus Vila Evangélica. Foi um prazer conhecê-lo(a)! Gostaríamos de agendar uma visita para conversarmos melhor. Quando seria um bom momento para você? Deus abençoe! 🙏'
  },
  {
    id: '3',
    nome: 'Agendamento de Visita',
    categoria: 'visita',
    conteudo: 'Olá {nome}, paz do Senhor! Gostaríamos de agendar uma visita pastoral. Quando seria um bom momento para conversarmos? Aguardamos seu retorno. Deus abençoe! 🙏'
  },
  {
    id: '4',
    nome: 'Acompanhamento Pós-Visita',
    categoria: 'acompanhamento',
    conteudo: 'Olá {nome}! Como você está? Espero que nossa conversa tenha sido edificante. Se precisar de qualquer coisa ou tiver alguma dúvida, estarei à disposição. Que Deus continue abençoando sua vida! 🙏'
  },
  {
    id: '5',
    nome: 'Convite para Culto',
    categoria: 'convite',
    conteudo: 'Olá {nome}! Gostaríamos de convidá-lo(a) para nosso culto {evento}. Será um momento especial de adoração e comunhão. Esperamos você! Local: Assembleia de Deus Vila Evangélica. Deus abençoe! 🙏'
  }
];

const EnvioMensagensView: React.FC<EnvioMensagensViewProps> = ({ onBack }) => {
  const [visitantes, setVisitantes] = useState<VisitanteRow[]>([]);
  const [mensagensEnviadas, setMensagensEnviadas] = useState<MensagemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateSelecionado, setTemplateSelecionado] = useState<Template | null>(null);
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [visitantesSelecionados, setVisitantesSelecionados] = useState<string[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  const { service: whatsappService, isConfigured, validatePhone } = useWhatsApp();

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Carregar visitantes
      let query = supabase
        .from('visitantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`);
      }

      if (filtroTipo !== 'Todos') {
        query = query.eq('tipo', filtroTipo);
      }

      const { data: visitantesData, error: visitantesError } = await query;
      if (visitantesError) throw visitantesError;
      setVisitantes(visitantesData || []);

      // Carregar histórico de mensagens
      const { data: mensagensData, error: mensagensError } = await supabase
        .from('mensagens')
        .select(`
          *,
          visitantes:visitante_id (nome, telefone)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (mensagensError) throw mensagensError;
      setMensagensEnviadas(mensagensData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, filtroTipo]);

  const handleSelecionarVisitante = (visitanteId: string) => {
    setVisitantesSelecionados(prev => {
      if (prev.includes(visitanteId)) {
        return prev.filter(id => id !== visitanteId);
      } else {
        return [...prev, visitanteId];
      }
    });
  };

  const selecionarTodos = () => {
    if (visitantesSelecionados.length === visitantes.length) {
      setVisitantesSelecionados([]);
    } else {
      setVisitantesSelecionados(visitantes.map(v => v.id!));
    }
  };

  const processarTemplate = (template: string, visitante: VisitanteRow) => {
    return template
      .replace(/{nome}/g, visitante.nome || 'amigo(a)')
      .replace(/{evento}/g, 'de domingo às 19h'); // Pode ser dinâmico no futuro
  };

  const getBaseMensagem = () => {
    // Prioriza o texto editado pelo usuário; se vazio e houver template, usa o conteúdo do template
    if (mensagemPersonalizada && mensagemPersonalizada.trim()) return mensagemPersonalizada;
    if (templateSelecionado) return templateSelecionado.conteudo;
    return '';
  };

  const enviarMensagemPara = async (visitante: VisitanteRow) => {
    try {
      const baseMensagem = getBaseMensagem();
      if (!baseMensagem.trim()) {
        alert('Selecione um template ou digite uma mensagem.');
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const usuarioId = userData.user?.id;
      if (!usuarioId) throw new Error('Sessão expirada. Faça login novamente.');

      const conteudoFinal = processarTemplate(baseMensagem, visitante);

      // Salvar no banco
      const { error: insertError } = await supabase
        .from('mensagens')
        .insert([
          {
            visitante_id: visitante.id,
            usuario_id: usuarioId,
            template_usado: templateSelecionado?.nome || 'Mensagem Editada',
            conteudo: conteudoFinal,
            status_envio: 'Enviada',
            data_envio: new Date().toISOString()
          }
        ]);
      if (insertError) throw insertError;

      // Abrir WhatsApp para o visitante
      if (visitante.telefone) {
        const whatsappUrl = `https://wa.me/55${visitante.telefone}?text=${encodeURIComponent(conteudoFinal)}`;
        window.open(whatsappUrl, '_blank');
      }

    } catch (error: any) {
      console.error('Erro ao enviar mensagem individual:', error);
      alert(`Erro ao enviar mensagem: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const enviarMensagens = async () => {
    if (visitantesSelecionados.length === 0) {
      alert('Selecione pelo menos um visitante!');
      return;
    }

    const baseMensagem = getBaseMensagem();
    if (!baseMensagem.trim()) {
      alert('Selecione um template ou digite uma mensagem personalizada!');
      return;
    }

    setEnviando(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const usuarioId = userData.user?.id;
      if (!usuarioId) throw new Error('Sessão expirada. Faça login novamente.');

      const mensagensParaEnviar = visitantesSelecionados.map(visitanteId => {
        const visitante = visitantes.find(v => v.id === visitanteId);
        if (!visitante) return null;

        const conteudoFinal = processarTemplate(baseMensagem, visitante);

        return {
          visitante_id: visitanteId,
          usuario_id: usuarioId,
          template_usado: templateSelecionado?.nome || 'Mensagem Editada',
          conteudo: conteudoFinal,
          status_envio: 'Enviada' as const,
          data_envio: new Date().toISOString()
        };
      }).filter(Boolean);

      // Salvar no banco de dados
      const { error } = await supabase
        .from('mensagens')
        .insert(mensagensParaEnviar as any);

      if (error) throw error;

      // Abrir WhatsApp para cada visitante
      for (const visitanteId of visitantesSelecionados) {
        const visitante = visitantes.find(v => v.id === visitanteId);
        if (visitante && visitante.telefone) {
          const conteudoFinal = processarTemplate(baseMensagem, visitante);
          const whatsappUrl = `https://wa.me/55${visitante.telefone}?text=${encodeURIComponent(conteudoFinal)}`;
          setTimeout(() => {
            window.open(whatsappUrl, '_blank');
          }, visitantesSelecionados.indexOf(visitanteId) * 1000);
        }
      }

      alert(`Mensagens enviadas para ${visitantesSelecionados.length} visitante(s)!`);
      setVisitantesSelecionados([]);
      loadData();

    } catch (error: any) {
      console.error('Erro ao enviar mensagens:', error);
      alert(`Erro ao enviar mensagens: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setEnviando(false);
    }
  };

  const visitantesFiltrados = visitantes.filter(visitante => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return visitante.nome?.toLowerCase().includes(search) ||
             visitante.telefone?.includes(search);
    }
    return true;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 3.5A10.5 10.5 0 0 0 3.5 20L2 22l2-.5A10.5 10.5 0 1 0 20 3.5zm-7 16a8.5 8.5 0 0 1-4.3-1.2L6 19l.7-2.6A8.6 8.6 0 1 1 13 19.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Envio de Mensagens WhatsApp</h2>
              <p className="text-slate-400 text-sm">Templates e envio em massa para visitantes</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
          >
            ← Voltar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates e Mensagem */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Templates de Mensagens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setTemplateSelecionado(template);
                    setMensagemPersonalizada(template.conteudo);
                  }}
                  className={`
                    p-3 rounded-lg border text-left transition-colors
                    ${templateSelecionado?.id === template.id 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-900/40 border-slate-700 text-slate-200 hover:border-emerald-500/30'
                    }
                  `}
                >
                  <div className="font-medium text-sm">{template.nome}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {template.conteudo.substring(0, 80)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview da Mensagem */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Mensagem</h3>
            <textarea
              value={mensagemPersonalizada}
              onChange={(e) => setMensagemPersonalizada(e.target.value)}
              placeholder={templateSelecionado ? 'Edite a mensagem do template...' : 'Digite sua mensagem personalizada aqui...'}
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="text-xs text-slate-400 mt-2">
              Dica: use {`{nome}`} e {`{evento}`} que serão substituídos automaticamente.
            </div>

            <div className="mt-4">
              <div className="text-slate-400 text-sm mb-1">Preview (primeiro selecionado):</div>
              <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm whitespace-pre-wrap">
                {(() => {
                  const primeiro = visitantes.find(v => v.id === visitantesSelecionados[0]);
                  const base = getBaseMensagem();
                  return primeiro ? processarTemplate(base, primeiro) : (templateSelecionado ? processarTemplate(getBaseMensagem(), { nome: '[Nome do Visitante]' } as VisitanteRow) : getBaseMensagem());
                })()}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={enviarMensagens}
                disabled={enviando || visitantesSelecionados.length === 0}
                className="px-4 py-2 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? 'Enviando...' : `Enviar para ${visitantesSelecionados.length} visitante(s)`}
              </button>
              {templateSelecionado && (
                <button
                  onClick={() => {
                    setTemplateSelecionado(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 font-semibold hover:bg-slate-600"
                >
                  Limpar Template
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Visitantes */}
        <div className="space-y-6">
          {/* Filtros */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-4">
            <h3 className="text-white font-semibold mb-3">Selecionar Visitantes</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou telefone..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
              />
              
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="Todos">Todos os tipos</option>
                <option value="Cristão">Cristão</option>
                <option value="Não Cristão">Não Cristão</option>
                <option value="Pregador">Pregador</option>
                <option value="Outro">Outro</option>
              </select>

              <button
                onClick={selecionarTodos}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
              >
                {visitantesSelecionados.length === visitantesFiltrados.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>
          </div>

          {/* Lista de Visitantes */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-4">
            <h4 className="text-white font-medium mb-3">
              Visitantes ({visitantesFiltrados.length})
            </h4>
            
            {loading ? (
              <div className="text-slate-400">Carregando...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {visitantesFiltrados.map((visitante) => (
                  <label
                    key={visitante.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900/40 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visitantesSelecionados.includes(visitante.id!)}
                      onChange={() => handleSelecionarVisitante(visitante.id!)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{visitante.nome}</div>
                      <div className="text-slate-400 text-xs">{visitante.telefone}</div>
                      <div className="text-slate-300 text-xs">{visitante.tipo}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); enviarMensagemPara(visitante); }}
                      className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                    >
                      Enviar
                    </button>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Histórico de Mensagens */}
      <div className="mt-6 rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <h3 className="text-white font-semibold mb-4">Histórico de Mensagens</h3>
        
        {loading ? (
          <div className="text-slate-400">Carregando histórico...</div>
        ) : mensagensEnviadas.length === 0 ? (
          <div className="text-slate-400">Nenhuma mensagem enviada ainda</div>
        ) : (
          <div className="space-y-3">
            {mensagensEnviadas.slice(0, 10).map((mensagem) => (
              <div key={mensagem.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">
                    {(mensagem as any).visitantes?.nome || 'Nome não encontrado'}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {mensagem.data_envio ? new Date(mensagem.data_envio).toLocaleDateString('pt-BR') : '-'}
                  </div>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Template: {mensagem.template_usado}
                </div>
                <div className="text-slate-400 text-xs line-clamp-2">
                  {mensagem.conteudo}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default EnvioMensagensView;

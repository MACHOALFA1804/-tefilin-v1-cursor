import React, { useState, useEffect } from 'react';
import { supabase, VisitanteRow, VisitaRow } from '../../lib/supabaseClient';

interface AgendamentoVisitasViewProps {
  onBack: () => void;
}

interface CalendarioItem {
  data: string;
  visitas: VisitaRow[];
  disponivel: boolean;
}

const AgendamentoVisitasView: React.FC<AgendamentoVisitasViewProps> = ({ onBack }) => {
  const [visitantesDisponiveis, setVisitantesDisponiveis] = useState<VisitanteRow[]>([]);
  const [visitasAgendadas, setVisitasAgendadas] = useState<VisitaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [enviando, setEnviando] = useState(false);
  
  // Form data
  const [novaVisita, setNovaVisita] = useState<Partial<VisitaRow>>({
    visitante_id: '',
    data_agendada: '',
    tipo_visita: 'Presencial',
    status: 'Agendada',
    observacoes: '',
    requer_acompanhamento: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro de autenticação:', error);
        throw error;
      }
      
      // Validar se o user.id é um UUID válido
      if (!user || !user.id) {
        throw new Error('Usuário não encontrado');
      }
      
      // Regex para validar UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user.id)) {
        console.error('ID do usuário não é um UUID válido:', user.id);
        throw new Error('ID do usuário inválido');
      }
      
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Carregar visitantes que precisam de visita (foco em não cristãos)
      const { data: visitantes, error: visitantesError } = await supabase
        .from('visitantes')
        .select('*')
        .in('tipo', ['Não Cristão', 'Outro'])
        .in('status', ['Aguardando Visita', 'Pendente'])
        .order('created_at', { ascending: false });

      if (visitantesError) {
        console.error('Erro ao carregar visitantes:', visitantesError);
        throw visitantesError;
      }
      
      setVisitantesDisponiveis(visitantes || []);

      // Carregar visitas agendadas (próximos 3 meses para não sobrecarregar)
      const hoje = new Date();
      const tresMesesAFrente = new Date();
      tresMesesAFrente.setMonth(hoje.getMonth() + 3);

      // Primeiro carregamos as visitas
      const { data: visitas, error: visitasError } = await supabase
        .from('visitas')
        .select('*')
        .in('status', ['Agendada', 'Reagendada'])
        .gte('data_agendada', hoje.toISOString())
        .lte('data_agendada', tresMesesAFrente.toISOString())
        .order('data_agendada', { ascending: true });

      if (visitasError) {
        console.error('Erro ao carregar visitas:', visitasError);
        throw visitasError;
      }

      // Depois carregamos os dados dos visitantes separadamente
      let visitasComVisitantes = visitas || [];
      
      if (visitas && visitas.length > 0) {
        // Extrair IDs únicos dos visitantes (compatível com TypeScript mais antigo)
        const visitanteIdsSet = new Set(visitas.map(v => v.visitante_id).filter(Boolean));
        const visitanteIds = Array.from(visitanteIdsSet);
        
        if (visitanteIds.length > 0) {
          const { data: visitantesData, error: visitantesDataError } = await supabase
            .from('visitantes')
            .select('id, nome, telefone, tipo')
            .in('id', visitanteIds);

          if (visitantesDataError) {
            console.error('Erro ao carregar dados dos visitantes:', visitantesDataError);
            // Não lance erro aqui, apenas mantenha as visitas sem dados dos visitantes
          } else {
            // Combinar os dados manualmente
            visitasComVisitantes = visitas.map(visita => ({
              ...visita,
              visitantes: visitantesData?.find(v => v.id === visita.visitante_id) || null
            }));
          }
        }
      }

      
      setVisitasAgendadas(visitasComVisitantes);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      alert(`Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!novaVisita.visitante_id) {
      newErrors.visitante_id = 'Selecione um visitante';
    } else {
      // Validar se visitante_id é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(novaVisita.visitante_id)) {
        newErrors.visitante_id = 'ID do visitante inválido';
      }
    }

    if (!novaVisita.data_agendada) {
      newErrors.data_agendada = 'Selecione data e hora';
    } else {
      const dataAgendada = new Date(novaVisita.data_agendada);
      const agora = new Date();
      
      if (isNaN(dataAgendada.getTime())) {
        newErrors.data_agendada = 'Data inválida';
      } else if (dataAgendada <= agora) {
        newErrors.data_agendada = 'A data deve ser futura';
      }
    }

    // Verificar se já existe visita agendada para o mesmo visitante no mesmo dia
    if (novaVisita.visitante_id && novaVisita.data_agendada) {
      const dataAgendada = new Date(novaVisita.data_agendada);
      if (!isNaN(dataAgendada.getTime())) {
        const dataStr = dataAgendada.toISOString().split('T')[0];
        
        const visitaExistente = visitasAgendadas.find(visita => 
          visita.visitante_id === novaVisita.visitante_id &&
          visita.data_agendada?.split('T')[0] === dataStr
        );

        if (visitaExistente) {
          newErrors.visitante_id = 'Já existe uma visita agendada para este visitante nesta data';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setEnviando(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        alert('Você precisa estar logado para agendar visitas');
        return;
      }

      // Preparar dados para inserção
      const visitaData = {
        visitante_id: novaVisita.visitante_id,
        pastor_id: user.id,
        data_agendada: novaVisita.data_agendada,
        tipo_visita: novaVisita.tipo_visita || 'Presencial',
        status: novaVisita.status || 'Agendada',
        observacoes: novaVisita.observacoes || null,
        requer_acompanhamento: novaVisita.requer_acompanhamento || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Dados da visita a serem inseridos:', visitaData);

      const { data: insertedVisita, error: insertError } = await supabase
        .from('visitas')
        .insert([visitaData])
        .select();

      if (insertError) {
        console.error('Erro ao inserir visita:', insertError);
        throw insertError;
      }

      console.log('Visita inserida com sucesso:', insertedVisita);

      // Atualizar status do visitante
      const { error: updateError } = await supabase
        .from('visitantes')
        .update({ 
          status: 'Aguardando Visita',
          updated_at: new Date().toISOString()
        })
        .eq('id', novaVisita.visitante_id);

      if (updateError) {
        console.error('Erro ao atualizar visitante:', updateError);
        // Não lance erro aqui, pois a visita já foi criada
        console.warn('Visita criada, mas falha ao atualizar status do visitante');
      }

      alert('Visita agendada com sucesso!');
      resetForm();
      await loadData();

    } catch (error: any) {
      console.error('Erro ao agendar visita:', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      } else if (error.hint) {
        errorMessage = error.hint;
      }
      
      alert(`Erro ao agendar visita: ${errorMessage}`);
    } finally {
      setEnviando(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setNovaVisita({
      visitante_id: '',
      data_agendada: '',
      tipo_visita: 'Presencial',
      status: 'Agendada',
      observacoes: '',
      requer_acompanhamento: false
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNovaVisita(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpar erro do campo quando usuário digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const gerarCalendario = () => {
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const dias: CalendarioItem[] = [];

    // Adicionar dias vazios do início do mês
    const diaSemanaInicio = inicio.getDay();
    for (let i = 0; i < diaSemanaInicio; i++) {
      const diaAnterior = new Date(inicio);
      diaAnterior.setDate(inicio.getDate() - (diaSemanaInicio - i));
      const dataStr = diaAnterior.toISOString().split('T')[0];
      
      dias.push({
        data: dataStr,
        visitas: [],
        disponivel: false
      });
    }

    // Adicionar dias do mês atual
    for (let dia = 1; dia <= fim.getDate(); dia++) {
      const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
      const dataStr = data.toISOString().split('T')[0];
      
      const visitasDoDia = visitasAgendadas.filter(visita => 
        visita.data_agendada?.split('T')[0] === dataStr
      );

      dias.push({
        data: dataStr,
        visitas: visitasDoDia,
        disponivel: data >= new Date()
      });
    }

    return dias;
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    const mesAnteriorDate = new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1);
    const hoje = new Date();
    
    // Não permitir navegar para meses passados
    if (mesAnteriorDate >= new Date(hoje.getFullYear(), hoje.getMonth(), 1)) {
      setMesAtual(mesAnteriorDate);
    }
  };

  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatarDataCompleta = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getMinDateTime = () => {
    const agora = new Date();
    agora.setHours(agora.getHours() + 1); // Pelo menos 1 hora no futuro
    return agora.toISOString().slice(0, 16);
  };

  const diasCalendario = gerarCalendario();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 19V8h14v11H5z"/>
                <path d="M7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Agendamento de Visitas</h2>
              <p className="text-slate-400 text-sm">Calendário de visitas pastorais</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300"
              disabled={visitantesDisponiveis.length === 0}
            >
              + Nova Visita
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            {/* Header do Calendário */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold capitalize">
                {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={mesAnterior}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={mesAtual <= new Date()}
                >
                  ←
                </button>
                <button
                  onClick={proximoMes}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendário Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Headers dos dias da semana */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                <div key={dia} className="text-center text-slate-400 text-sm font-medium p-2">
                  {dia}
                </div>
              ))}

              {/* Dias do mês */}
              {diasCalendario.map((item, index) => {
                const dia = new Date(item.data).getDate();
                const temVisitas = item.visitas.length > 0;
                const isHoje = item.data === new Date().toISOString().split('T')[0];
                const isMesAtual = new Date(item.data).getMonth() === mesAtual.getMonth();

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square border rounded-lg p-1 text-sm transition-all hover:scale-105
                      ${!isMesAtual ? 'border-slate-800 bg-slate-900/20 opacity-30' : 
                        item.disponivel ? 'border-slate-700 bg-slate-900/40 hover:bg-slate-900/60' : 
                        'border-slate-800 bg-slate-800/60 opacity-50'}
                      ${isHoje ? 'ring-2 ring-cyan-400' : ''}
                      ${temVisitas ? 'bg-green-500/20 border-green-500/40' : ''}
                    `}
                  >
                    <div className="text-center h-full flex flex-col justify-between">
                      <div className={`font-medium ${isHoje ? 'text-cyan-400' : isMesAtual ? 'text-slate-200' : 'text-slate-500'}`}>
                        {dia}
                      </div>
                      {temVisitas && (
                        <div className="mt-auto">
                          <div className="w-2 h-2 rounded-full bg-green-400 mx-auto mb-1"></div>
                          <div className="text-xs text-green-300">
                            {item.visitas.length}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border-2 border-cyan-400"></div>
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/40"></div>
                <span>Com visitas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Próximas Visitas */}
        <div className="space-y-6">
          {/* Próximas Visitas */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Próximas Visitas</h3>
              <span className="text-xs text-slate-400">
                {visitasAgendadas.length} total
              </span>
            </div>
            
            {loading ? (
              <div className="text-slate-400">Carregando...</div>
            ) : visitasAgendadas.length === 0 ? (
              <div className="text-slate-400 text-sm">Nenhuma visita agendada</div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {visitasAgendadas.slice(0, 8).map((visita) => (
                  <div key={visita.id} className="rounded-lg border border-slate-700 p-3 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                    <div className="text-white font-medium text-sm">
                      {(visita as any).visitantes?.nome || 'Nome não encontrado'}
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      {visita.data_agendada ? formatarData(visita.data_agendada) : '-'}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs
                        ${visita.tipo_visita === 'Presencial' ? 'bg-blue-500/20 text-blue-300' :
                          visita.tipo_visita === 'Telefone' ? 'bg-green-500/20 text-green-300' :
                          visita.tipo_visita === 'WhatsApp' ? 'bg-emerald-500/20 text-emerald-300' :
                          'bg-slate-500/20 text-slate-300'}`}>
                        {visita.tipo_visita}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs
                        ${visita.status === 'Agendada' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-orange-500/20 text-orange-300'}`}>
                        {visita.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visitantes Pendentes */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Precisam de Visita</h3>
              <span className="text-xs text-slate-400">
                {visitantesDisponiveis.length} pessoas
              </span>
            </div>
            
            {loading ? (
              <div className="text-slate-400">Carregando...</div>
            ) : visitantesDisponiveis.length === 0 ? (
              <div className="text-slate-400 text-sm">Nenhum visitante pendente</div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {visitantesDisponiveis.map((visitante) => (
                  <div key={visitante.id} className="rounded-lg border border-slate-700 p-3 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                    <div className="text-white font-medium text-sm">{visitante.nome}</div>
                    <div className="text-slate-400 text-xs">{visitante.telefone}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs
                        ${visitante.tipo === 'Não Cristão' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'}`}>
                        {visitante.tipo}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-300">
                        {visitante.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nova Visita */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Agendar Nova Visita</h3>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white"
                disabled={enviando}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Visitante *
                </label>
                <select
                  name="visitante_id"
                  value={novaVisita.visitante_id || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border focus:outline-none focus:border-cyan-500/50
                    ${errors.visitante_id ? 'border-red-500' : 'border-slate-700'}`}
                  required
                  disabled={enviando}
                >
                  <option value="">Selecione um visitante</option>
                  {visitantesDisponiveis.map((visitante) => (
                    <option key={visitante.id} value={visitante.id}>
                      {visitante.nome} - {visitante.tipo}
                    </option>
                  ))}
                </select>
                {errors.visitante_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.visitante_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  name="data_agendada"
                  value={novaVisita.data_agendada || ''}
                  onChange={handleInputChange}
                  min={getMinDateTime()}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border focus:outline-none focus:border-cyan-500/50
                    ${errors.data_agendada ? 'border-red-500' : 'border-slate-700'}`}
                  required
                  disabled={enviando}
                />
                {errors.data_agendada && (
                  <p className="text-red-400 text-xs mt-1">{errors.data_agendada}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Visita
                </label>
                <select
                  name="tipo_visita"
                  value={novaVisita.tipo_visita || 'Presencial'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  disabled={enviando}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Telefone">Telefone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={novaVisita.observacoes || ''}
                  onChange={handleInputChange}
                  placeholder="Detalhes sobre a visita, endereço, etc..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none"
                  disabled={enviando}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="requer_acompanhamento"
                  checked={novaVisita.requer_acompanhamento || false}
                  onChange={handleInputChange}
                  className="rounded"
                  disabled={enviando}
                />
                <label className="text-slate-300 text-sm">Requer acompanhamento posterior</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 font-semibold hover:bg-slate-600 disabled:opacity-50"
                  disabled={enviando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={enviando}
                >
                  {enviando ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AgendamentoVisitasView;
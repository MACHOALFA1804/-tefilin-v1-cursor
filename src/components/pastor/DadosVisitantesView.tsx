import React, { useState, useEffect, useCallback } from 'react';
import { supabase, VisitanteRow } from '../../lib/supabaseClient';

interface DadosVisitantesViewProps {
  onBack: () => void;
}

const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' }) => (
  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${color}`}>
    {children}
  </span>
);

const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; color?: string }> = ({ icon, value, label, color = 'text-cyan-400' }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300">
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-slate-400 text-sm">{label}</div>
      </div>
    </div>
  </div>
);

const DadosVisitantesView: React.FC<DadosVisitantesViewProps> = ({ onBack }) => {
  const [visitantes, setVisitantes] = useState<VisitanteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('30'); // dias
  const [searchTerm, setSearchTerm] = useState('');

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    cristãos: 0,
    naoCristãos: 0,
    pregadores: 0,
    aguardandoVisita: 0,
    visitados: 0,
    novosMembros: 0,
    hoje: 0,
    semana: 0,
    mes: 0
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Carregar visitantes com filtros
      let query = supabase
        .from('visitantes')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,congregacao_origem.ilike.%${searchTerm}%`);
      }

      if (filtroTipo !== 'Todos') {
        query = query.eq('tipo', filtroTipo);
      }

      if (filtroStatus !== 'Todos') {
        query = query.eq('status', filtroStatus);
      }

      // Filtro por período
      if (filtroPeriodo !== 'Todos') {
        const dias = parseInt(filtroPeriodo);
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);
        query = query.gte('created_at', dataLimite.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      setVisitantes(data || []);

      // Calcular estatísticas
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const semanaAtras = new Date();
      semanaAtras.setDate(hoje.getDate() - 7);
      
      const mesAtras = new Date();
      mesAtras.setDate(hoje.getDate() - 30);

      // Buscar estatísticas gerais
      const { data: allVisitantes } = await supabase
        .from('visitantes')
        .select('*');

      if (allVisitantes) {
        const statsData = {
          total: allVisitantes.length,
          cristãos: allVisitantes.filter(v => v.tipo === 'Cristão').length,
          naoCristãos: allVisitantes.filter(v => v.tipo === 'Não Cristão').length,
          pregadores: allVisitantes.filter(v => v.tipo === 'Pregador').length,
          aguardandoVisita: allVisitantes.filter(v => v.status === 'Aguardando Visita').length,
          visitados: allVisitantes.filter(v => v.status === 'Visitado').length,
          novosMembros: allVisitantes.filter(v => v.status === 'Novo Membro').length,
          hoje: allVisitantes.filter(v => new Date(v.created_at!) >= hoje).length,
          semana: allVisitantes.filter(v => new Date(v.created_at!) >= semanaAtras).length,
          mes: allVisitantes.filter(v => new Date(v.created_at!) >= mesAtras).length
        };
        setStats(statsData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filtroTipo, filtroStatus, filtroPeriodo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Visitado': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'Aguardando Visita': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'Pendente': return 'bg-rose-500/10 border-rose-500/30 text-rose-300';
      case 'Novo Membro': return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      default: return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    }
  };

  const getTipoColor = (tipo?: string) => {
    switch (tipo) {
      case 'Não Cristão': return 'bg-orange-500/10 border-orange-500/30 text-orange-300';
      case 'Pregador': return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'Outro': return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
      default: return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.25L24 15.5V22H6v-6.5l3.5 3.75zm-.5-3.25H18v-3.5l1.5 1.75v1.75z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Dados de Visitantes</h2>
            <p className="text-slate-400 text-sm">Análise completa e estatísticas dos visitantes</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Pesquisar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, telefone ou congregação..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Todos">Todos os status</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Aguardando Visita">Aguardando Visita</option>
              <option value="Visitado">Visitado</option>
              <option value="Novo Membro">Novo Membro</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Todos">Todos os períodos</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0z"/></svg>}
          value={stats.total}
          label="Total de Visitantes"
          color="text-cyan-400"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7z"/></svg>}
          value={stats.aguardandoVisita}
          label="Aguardando Visita"
          color="text-yellow-400"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          value={stats.visitados}
          label="Visitados"
          color="text-emerald-400"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>}
          value={stats.novosMembros}
          label="Novos Membros"
          color="text-purple-400"
        />
      </div>

      {/* Estatísticas por Período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
          value={stats.hoje}
          label="Visitantes Hoje"
          color="text-orange-400"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
          value={stats.semana}
          label="Esta Semana"
          color="text-blue-400"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
          value={stats.mes}
          label="Este Mês"
          color="text-green-400"
        />
      </div>

      {/* Lista de Visitantes */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">
            Lista de Visitantes ({visitantes.length} encontrados)
          </h3>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
          >
            ← Voltar
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-8">
            Carregando dados...
          </div>
        ) : visitantes.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Nenhum visitante encontrado com os filtros aplicados
          </div>
        ) : (
          <div className="space-y-3">
            {visitantes.map((visitante) => (
              <div key={visitante.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{visitante.nome}</span>
                    <Chip color={getTipoColor(visitante.tipo)}>{visitante.tipo}</Chip>
                    <Chip color={getStatusColor(visitante.status)}>{visitante.status}</Chip>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {visitante.created_at ? new Date(visitante.created_at).toLocaleDateString('pt-BR') : '-'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-400">Telefone:</span> {visitante.telefone || '-'}
                  </div>
                  {visitante.congregacao_origem && (
                    <div>
                      <span className="text-slate-400">Congregação:</span> {visitante.congregacao_origem}
                    </div>
                  )}
                  {visitante.quem_acompanha && (
                    <div>
                      <span className="text-slate-400">Acompanha:</span> {visitante.quem_acompanha}
                    </div>
                  )}
                </div>

                {visitante.observacoes && (
                  <div className="mt-2 text-sm text-slate-300">
                    <span className="text-slate-400">Observações:</span> {visitante.observacoes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default DadosVisitantesView;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from '../components/common/ThemeToggle';
import AgendamentoVisitasView from '../components/pastor/AgendamentoVisitasView';
import EnvioMensagensView from '../components/pastor/EnvioMensagensView';
import DadosVisitantesView from '../components/pastor/DadosVisitantesView';
import RelatoriosView from '../components/pastor/RelatoriosView';

type ActiveView = 'dashboard' | 'dados' | 'agendamento' | 'mensagens' | 'relatorios';

const PastorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [stats, setStats] = useState({
    totalVisitantes: 0,
    novosMembros: 0,
    emDiscipulado: 0,
    cultosRealizados: 0
  });
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas pastorais
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas de visitantes
      const { data: visitantes, error: visitantesError } = await supabase
        .from('visitantes')
        .select('*');

      if (visitantesError) {
        console.error('Erro ao carregar visitantes:', visitantesError);
        return;
      }

      // Buscar estatísticas de visitas
      const { data: visitas, error: visitasError } = await supabase
        .from('visitas')
        .select('*');

      if (visitasError) {
        console.error('Erro ao carregar visitas:', visitasError);
        return;
      }

      if (visitantes) {
        const statsData = {
          totalVisitantes: visitantes.length,
          novosMembros: visitantes.filter(v => v.status === 'Novo Membro').length,
          emDiscipulado: visitantes.filter(v => v.status === 'Visitado').length,
          cultosRealizados: visitas ? visitas.filter(v => v.status === 'Realizada').length : 0
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas pastorais:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Recarregar dados quando voltar para o dashboard
  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    loadStats(); // Recarregar estatísticas
  };

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case 'dados':
        return <DadosVisitantesView onBack={handleBackToDashboard} />;
      case 'agendamento':
        return <AgendamentoVisitasView onBack={handleBackToDashboard} />;
      case 'mensagens':
        return <EnvioMensagensView onBack={handleBackToDashboard} />;
      case 'relatorios':
        return <RelatoriosView onBack={handleBackToDashboard} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Header com Toggle de Tema */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-3xl font-bold">Dashboard Pastoral</h1>
                <p className="text-slate-400 text-lg mt-1">Acompanhamento espiritual e gestão de visitantes</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-2 py-1 rounded bg-cyan-400 text-slate-900 text-xs font-bold">AI</div>
                <ThemeToggle />
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>

            {/* Dashboard de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Visão Geral dos Visitantes */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Visão Geral dos Visitantes</h2>
                    <p className="text-slate-400 text-sm">Estatísticas e relatórios</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Acompanhar o crescimento da igreja através de estatísticas detalhadas dos visitantes.
                </p>
                <button 
                  onClick={() => setActiveView('dados')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
                >
                  Ver Estatísticas
                </button>
              </div>

              {/* Acompanhamento Espiritual */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Acompanhamento Espiritual</h2>
                    <p className="text-slate-400 text-sm">Discipulado e visitas</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Acompanhar o desenvolvimento espiritual dos visitantes e novos membros.
                </p>
                <button 
                  onClick={() => setActiveView('agendamento')}
                  className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  Acompanhar
                </button>
              </div>

              {/* Agendamento de Visitas */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Agendamento de Visitas</h2>
                    <p className="text-slate-400 text-sm">Organizar e planejar</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Agendar visitas pastorais e acompanhar o histórico de acompanhamento.
                </p>
                <button 
                  onClick={() => setActiveView('agendamento')}
                  className="w-full px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 transition-colors"
                >
                  Agendar Visitas
                </button>
              </div>

              {/* Relatórios e Análises */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Relatórios e Análises</h2>
                    <p className="text-slate-400 text-sm">Métricas e insights</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Gerar relatórios detalhados sobre o crescimento e desenvolvimento da igreja.
                </p>
                <button 
                  onClick={() => setActiveView('relatorios')}
                  className="w-full px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
                >
                  Ver Relatórios
                </button>
              </div>

              {/* Mensagens e Comunicação */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Mensagens e Comunicação</h2>
                    <p className="text-slate-400 text-sm">Contato com visitantes</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Enviar mensagens personalizadas e manter contato com visitantes e membros.
                </p>
                <button 
                  onClick={() => setActiveView('mensagens')}
                  className="w-full px-4 py-3 rounded-lg bg-yellow-400 text-slate-900 font-bold shadow-md shadow-yellow-500/30 hover:bg-yellow-300 transition-colors"
                >
                  Enviar Mensagens
                </button>
              </div>

              {/* Cultos e Eventos */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Cultos e Eventos</h2>
                    <p className="text-slate-400 text-sm">Programação da igreja</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Gerenciar programação de cultos, eventos e atividades da igreja.
                </p>
                <button 
                  onClick={() => setActiveView('dados')}
                  className="w-full px-4 py-3 rounded-lg bg-red-400 text-slate-900 font-bold shadow-md shadow-red-500/30 hover:bg-red-300 transition-colors"
                >
                  Gerenciar Eventos
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {loading ? '...' : stats.totalVisitantes}
                </div>
                <div className="text-slate-400 text-sm">Total Visitantes</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {loading ? '...' : stats.novosMembros}
                </div>
                <div className="text-slate-400 text-sm">Novos Membros</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {loading ? '...' : stats.emDiscipulado}
                </div>
                <div className="text-slate-400 text-sm">Em Discipulado</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {loading ? '...' : stats.cultosRealizados}
                </div>
                <div className="text-slate-400 text-sm">Cultos Realizados</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
          </main>
        );
    }
  };

  return renderContent();
};

export default PastorDashboard;



import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import DadosVisitantesView from '../components/pastor/DadosVisitantesView';
import AgendamentoVisitasView from '../components/pastor/AgendamentoVisitasView';
import EnvioMensagensView from '../components/pastor/EnvioMensagensView';
import RelatoriosView from '../components/pastor/RelatoriosView';

type ActiveView = 'dashboard' | 'dados' | 'agendamento' | 'mensagens' | 'relatorios';

const PastorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case 'dados':
        return <DadosVisitantesView onBack={() => setActiveView('dashboard')} />;
      case 'agendamento':
        return <AgendamentoVisitasView onBack={() => setActiveView('dashboard')} />;
      case 'mensagens':
        return <EnvioMensagensView onBack={() => setActiveView('dashboard')} />;
      case 'relatorios':
        return <RelatoriosView onBack={() => setActiveView('dashboard')} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Dashboard de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visualizar Dados */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.25L24 15.5V22H6v-6.5l3.5 3.75zm-.5-3.25H18v-3.5l1.5 1.75v1.75z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Visualizar Dados</h2>
                    <p className="text-slate-400 text-sm">Análise de visitantes e estatísticas</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Lista completa de visitantes com filtros avançados, gráficos e análises sobre o crescimento da igreja.
                </p>
                <button 
                  onClick={() => setActiveView('dados')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
                >
                  Ver Dados
                </button>
              </div>

              {/* Agendar Visitas */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 19V8h14v11H5z"/>
                      <path d="M7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Agendar Visitas</h2>
                    <p className="text-slate-400 text-sm">Calendário de visitas pastorais</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Calendário visual para agendar visitas a visitantes não cristãos com controle de datas e lembretes.
                </p>
                <button 
                  onClick={() => setActiveView('agendamento')}
                  className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  Agendar Visitas
                </button>
              </div>

              {/* Enviar Mensagens WhatsApp */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 3.5A10.5 10.5 0 0 0 3.5 20L2 22l2-.5A10.5 10.5 0 1 0 20 3.5zm-7 16a8.5 8.5 0 0 1-4.3-1.2L6 19l.7-2.6A8.6 8.6 0 1 1 13 19.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Enviar Mensagens WhatsApp</h2>
                    <p className="text-slate-400 text-sm">Templates e envio em massa</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Escolha templates de mensagens, envio para grupos específicos e histórico completo das mensagens enviadas.
                </p>
                <button 
                  onClick={() => setActiveView('mensagens')}
                  className="w-full px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
                >
                  Enviar Mensagens
                </button>
              </div>

              {/* Gerar Relatórios */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Gerar Relatórios</h2>
                    <p className="text-slate-400 text-sm">PDF e CSV personalizados</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Geração de relatórios em PDF ou CSV com filtros personalizados e dados de visitantes, visitas e crescimento.
                </p>
                <button 
                  onClick={() => setActiveView('relatorios')}
                  className="w-full px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 transition-colors"
                >
                  Gerar Relatórios
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">0</div>
                <div className="text-slate-400 text-sm">Visitantes Hoje</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <div className="text-slate-400 text-sm">Aguardando Visita</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">0</div>
                <div className="text-slate-400 text-sm">Visitados</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-slate-400 text-sm">Novos Membros</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
          </main>
        );
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dados': return 'Dados de Visitantes';
      case 'agendamento': return 'Agendamento de Visitas';
      case 'mensagens': return 'Envio de Mensagens WhatsApp';
      case 'relatorios': return 'Geração de Relatórios';
      default: return 'Pastoral - TEFILIN v1';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-cyan-500/30 bg-slate-900/80 sticky top-0 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 text-slate-900 font-black grid place-items-center">iA</div>
            <h1 className="text-lg md:text-xl font-bold">{getViewTitle()}</h1>
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-cyan-500/30 text-cyan-300 bg-cyan-500/10">
              "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor" - Col 3:23
            </span>
          </div>
          <div className="flex items-center gap-3">
            {activeView !== 'dashboard' && (
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
              >
                ← Dashboard
              </button>
            )}
            <span className="text-slate-300 text-sm">Pastor João</span>
            <Link
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-sm font-semibold hover:bg-rose-500/25"
              to="/"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      {renderContent()}
    </div>
  );
};

export default PastorDashboard;



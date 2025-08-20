import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import CadastroVisitantesView from '../components/recepcao/CadastroVisitantesView';
import HistoricoVisitantesView from '../components/recepcao/HistoricoVisitantesView';
import ThemeToggle from '../components/common/ThemeToggle';

type ActiveView = 'dashboard' | 'cadastro' | 'historico';

const RecepcaoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case 'cadastro':
        return <CadastroVisitantesView onBack={() => setActiveView('dashboard')} />;
      case 'historico':
        return <HistoricoVisitantesView onBack={() => setActiveView('dashboard')} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Header com Toggle de Tema */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-3xl font-bold">Dashboard de Recepção</h1>
                <p className="text-slate-400 text-lg mt-1">Gestão de visitantes e agendamentos</p>
              </div>
              <div className="flex items-center gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cadastro de Visitantes */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Cadastro de Visitantes</h2>
                    <p className="text-slate-400 text-sm">Novos visitantes</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Cadastrar novos visitantes com informações completas, incluindo tipo, status e observações.
                </p>
                <button 
                  onClick={() => setActiveView('cadastro')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
                >
                  Cadastrar Visitante
                </button>
              </div>

              {/* Histórico de Visitantes */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Histórico de Visitantes</h2>
                    <p className="text-slate-400 text-sm">Consulta e gestão</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Visualizar, filtrar e gerenciar todos os visitantes cadastrados no sistema.
                </p>
                <button 
                  onClick={() => setActiveView('historico')}
                  className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  Ver Histórico
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-slate-400 text-sm">Total Visitantes</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-slate-400 text-sm">Aguardando</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-slate-400 text-sm">Visitados</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">0</div>
                <div className="text-slate-400 text-sm">Novos Membros</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
          </main>
        );
    }
  };

  return renderContent();
};

export default RecepcaoDashboard;
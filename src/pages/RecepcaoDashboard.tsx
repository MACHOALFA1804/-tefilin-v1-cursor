import React, { useState } from 'react';
import CadastroVisitantesView from '../components/recepcao/CadastroVisitantesView';
import HistoricoVisitantesView from '../components/recepcao/HistoricoVisitantesView';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import { useResponsiveClasses } from '../hooks/useResponsive';

type ActiveView = 'dashboard' | 'cadastro' | 'historico';

const RecepcaoDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const classes = useResponsiveClasses();

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case 'cadastro':
        return (
          <ResponsiveLayout
            title="Cadastro de Visitantes"
            subtitle="Registrar novos visitantes na igreja"
            showBackButton
            onBack={() => setActiveView('dashboard')}
          >
            <CadastroVisitantesView onBack={() => setActiveView('dashboard')} />
          </ResponsiveLayout>
        );
      case 'historico':
        return (
          <ResponsiveLayout
            title="Histórico de Visitantes"
            subtitle="Visualizar e gerenciar visitantes cadastrados"
            showBackButton
            onBack={() => setActiveView('dashboard')}
          >
            <HistoricoVisitantesView onBack={() => setActiveView('dashboard')} />
          </ResponsiveLayout>
        );
      default:
        return (
          <ResponsiveLayout
            title="Dashboard de Recepção"
            subtitle="Gerenciamento de visitantes da igreja"
          >
            {/* Dashboard de Navegação */}
            <div className={classes.grid.cards}>
              {/* Cadastrar Visitantes */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Cadastrar Visitantes</h2>
                    <p className="text-slate-400 text-sm">Registrar novos visitantes na igreja</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Formulário completo para cadastro de visitantes com campos obrigatórios: Nome, Telefone e classificação (Cristão, Não cristão, Pregador).
                </p>
                <button 
                  onClick={() => setActiveView('cadastro')}
                  className="w-full px-4 py-3 rounded-lg bg-cyan-400 text-slate-900 font-bold shadow-md shadow-cyan-500/30 hover:bg-cyan-300 transition-colors"
                >
                  Acessar Cadastro
                </button>
              </div>

              {/* Histórico de Visitantes */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Histórico de Visitantes</h2>
                    <p className="text-slate-400 text-sm">Visualizar e pesquisar visitantes cadastrados</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Tabela completa com todos os visitantes, funcionalidades de pesquisa por nome, telefone ou congregação e filtros por tipo.
                </p>
                <button 
                  onClick={() => setActiveView('historico')}
                  className="w-full px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
                >
                  Ver Histórico
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">0</div>
                <div className="text-slate-400 text-sm">Hoje</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">0</div>
                <div className="text-slate-400 text-sm">Esta Semana</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <div className="text-slate-400 text-sm">Este Mês</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-rose-400">0</div>
                <div className="text-slate-400 text-sm">Total</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
          </ResponsiveLayout>
        );
    }
  };

  return renderContent();
};

export default RecepcaoDashboard;
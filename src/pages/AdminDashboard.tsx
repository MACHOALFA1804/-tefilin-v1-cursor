import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import GerenciamentoUsuariosView from '../components/admin/GerenciamentoUsuariosView';
import ConfiguracoesView from '../components/admin/ConfiguracoesView';
import BackupView from '../components/admin/BackupView';

type ActiveView = 'dashboard' | 'usuarios' | 'configuracoes' | 'backup';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Renderizar view baseado na seleção
  const renderContent = () => {
    switch (activeView) {
      case 'usuarios':
        return <GerenciamentoUsuariosView onBack={() => setActiveView('dashboard')} />;
      case 'configuracoes':
        return <ConfiguracoesView onBack={() => setActiveView('dashboard')} />;
      case 'backup':
        return <BackupView onBack={() => setActiveView('dashboard')} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Dashboard de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gerenciar Usuários */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 11V7a4 4 0 1 0-8 0v4H4v10h16V11zM10 7a2 2 0 1 1 4 0v4h-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Gerenciar Usuários</h2>
                    <p className="text-slate-400 text-sm">Controle de acesso e permissões</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Adicionar novos logins com e-mail e senha, excluir usuários existentes e definir funções (Recepcionista, Pastor ou Admin).
                </p>
                <button 
                  onClick={() => setActiveView('usuarios')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
                >
                  Gerenciar Usuários
                </button>
              </div>

              {/* Configurações do Sistema */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 3h4l1 3h3l1 4-3 1v2l3 1-1 4h-3l-1 3h-4l-1-3H6l-1-4 3-1v-2L5 10l1-4h3l1-3z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Configurações do Sistema</h2>
                    <p className="text-slate-400 text-sm">Personalização e ajustes</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Editar textos do sistema, personalizar layout dos relatórios PDF, atualizar endereço da igreja e fazer upload da logo.
                </p>
                <button 
                  onClick={() => setActiveView('configuracoes')}
                  className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  Configurar Sistema
                </button>
              </div>

              {/* Backup do Sistema */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Backup do Sistema</h2>
                    <p className="text-slate-400 text-sm">Segurança dos dados</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Opção de backup manual, configuração de backup automático agendado e restauração de dados do sistema.
                </p>
                <button 
                  onClick={() => setActiveView('backup')}
                  className="w-full px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 transition-colors"
                >
                  Gerenciar Backup
                </button>
              </div>
            </div>

            {/* Status do Sistema */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Database</span>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    ● Online
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">WhatsApp</span>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    ● Conectado
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Backup</span>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                    ● Agendado
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">PDF Generator</span>
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    ● Funcionando
                  </span>
                </div>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">0</div>
                <div className="text-slate-400 text-sm">Visitantes</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-slate-400 text-sm">Usuários</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">0</div>
                <div className="text-slate-400 text-sm">Mensagens</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-slate-400 text-sm">Backups</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
          </main>
        );
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'usuarios': return 'Gerenciamento de Usuários';
      case 'configuracoes': return 'Configurações do Sistema';
      case 'backup': return 'Backup do Sistema';
      default: return 'Admin - TEFILIN v1';
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
            <span className="text-slate-300 text-sm">Admin Sistema</span>
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

export default AdminDashboard;



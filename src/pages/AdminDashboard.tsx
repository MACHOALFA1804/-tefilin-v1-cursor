import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import GerenciamentoUsuariosView from '../components/admin/GerenciamentoUsuariosView';
import ConfiguracoesView from '../components/admin/ConfiguracoesView';
import BackupView from '../components/admin/BackupView';
import WhatsAppConfigView from '../components/admin/WhatsAppConfigView';
import ThemeToggle from '../components/common/ThemeToggle';

type ActiveView = 'dashboard' | 'usuarios' | 'configuracoes' | 'backup' | 'whatsapp';

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
        case 'whatsapp':
          return <WhatsAppConfigView onBack={() => setActiveView('dashboard')} />;
        default:
        return (
          <main className="max-w-7xl mx-auto px-4 py-6">
            {/* Header com Toggle de Tema */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-3xl font-bold">Dashboard Administrativo</h1>
                <p className="text-slate-400 text-lg mt-1">Gerenciamento completo do sistema</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              {/* Configurações do WhatsApp */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 3.5A10.5 10.5 0 0 0 3.5 20L2 22l2-.5A10.5 10.5 0 1 0 20 3.5zm-7 16a8.5 8.5 0 0 1-4.3-1.2L6 19l.7-2.6A8.6 8.6 0 1 1 13 19.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Configurações do WhatsApp</h2>
                    <p className="text-slate-400 text-sm">Integração avançada</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Configurar API do WhatsApp Business, webhooks, mensagens automáticas e horários de atendimento.
                </p>
                <button 
                  onClick={() => setActiveView('whatsapp')}
                  className="w-full px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
                >
                  Configurar WhatsApp
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-slate-400 text-sm">Usuários</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-slate-400 text-sm">Visitantes</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-slate-400 text-sm">Relatórios</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">0</div>
                <div className="text-slate-400 text-sm">Mensagens</div>
              </div>
            </div>

            <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
          </main>
        );
    }
  };

  return renderContent();
};

export default AdminDashboard;



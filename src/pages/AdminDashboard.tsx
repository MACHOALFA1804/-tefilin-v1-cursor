import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from '../components/common/ThemeToggle';
import GerenciamentoUsuariosView from '../components/admin/GerenciamentoUsuariosView';
import ConfiguracoesView from '../components/admin/ConfiguracoesView';
import BackupView from '../components/admin/BackupView';
import WhatsAppConfigView from '../components/admin/WhatsAppConfigView';

type ActiveView = 'dashboard' | 'usuarios' | 'configuracoes' | 'backup' | 'whatsapp';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [stats, setStats] = useState({
    usuarios: 0,
    visitantes: 0,
    relatorios: 0,
    mensagens: 0
  });
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas do sistema
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas de usuários
      const { count: usuariosCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Buscar estatísticas de visitantes
      const { count: visitantesCount } = await supabase
        .from('visitantes')
        .select('*', { count: 'exact', head: true });

      // Buscar estatísticas de mensagens
      const { count: mensagensCount } = await supabase
        .from('mensagens')
        .select('*', { count: 'exact', head: true });

      setStats({
        usuarios: usuariosCount || 0,
        visitantes: visitantesCount || 0,
        relatorios: 0, // Placeholder para futuras implementações
        mensagens: mensagensCount || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
      case 'usuarios':
        return <GerenciamentoUsuariosView onBack={handleBackToDashboard} />;
      case 'configuracoes':
        return <ConfiguracoesView onBack={handleBackToDashboard} />;
      case 'backup':
        return <BackupView onBack={handleBackToDashboard} />;
      case 'whatsapp':
        return <WhatsAppConfigView onBack={handleBackToDashboard} />;
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
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Gerenciar Usuários</h2>
                    <p className="text-slate-400 text-sm">Controle de acesso</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Gerenciar usuários, permissões e níveis de acesso ao sistema.
                </p>
                <button 
                  onClick={() => setActiveView('usuarios')}
                  className="w-full px-4 py-3 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
                >
                  Gerenciar Usuários
                </button>
              </div>

              {/* Configurações */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Configurações</h2>
                    <p className="text-slate-400 text-sm">Sistema e igreja</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Configurar parâmetros do sistema, informações da igreja e preferências.
                </p>
                <button 
                  onClick={() => setActiveView('configuracoes')}
                  className="w-full px-4 py-3 rounded-lg bg-green-400 text-slate-900 font-bold shadow-md shadow-green-500/30 hover:bg-green-300 transition-colors"
                >
                  Configurações
                </button>
              </div>

              {/* Backup */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">Backup</h2>
                    <p className="text-slate-400 text-sm">Segurança de dados</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Realizar backup dos dados e restaurar informações quando necessário.
                </p>
                <button 
                  onClick={() => setActiveView('backup')}
                  className="w-full px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 transition-colors"
                >
                  Backup
                </button>
              </div>

              {/* WhatsApp */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-semibold">WhatsApp</h2>
                    <p className="text-slate-400 text-sm">Integração</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Configurar integração com WhatsApp para envio de mensagens automáticas.
                </p>
                <button 
                  onClick={() => setActiveView('whatsapp')}
                  className="w-full px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 transition-colors"
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {loading ? '...' : stats.usuarios}
                </div>
                <div className="text-slate-400 text-sm">Usuários</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {loading ? '...' : stats.visitantes}
                </div>
                <div className="text-slate-400 text-sm">Visitantes</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {loading ? '...' : stats.relatorios}
                </div>
                <div className="text-slate-400 text-sm">Relatórios</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {loading ? '...' : stats.mensagens}
                </div>
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



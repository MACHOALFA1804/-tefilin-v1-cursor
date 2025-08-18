import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Pill: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', children }) => (
  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${color}`}>{children}</span>
);

const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string }> = ({ icon, value, label }) => (
  <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">{icon}</div>
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
    <h3 className="text-white font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [totalVisitantes, setTotalVisitantes] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalMensagens, setTotalMensagens] = useState(0);
  const [totalCultos, setTotalCultos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);

      // Fetch total visitantes
      const { count: visitantesCount, error: visitantesError } = await supabase
        .from('visitantes')
        .select('count', { count: 'exact', head: true });
      if (!visitantesError) setTotalVisitantes(visitantesCount || 0);

      // Fetch total users (from auth.users table)
      const { count: usersCount, error: usersError } = await supabase.from('auth.users').select('count', { count: 'exact', head: true });
      if (!usersError) setTotalUsuarios(usersCount || 0);

      // Fetch total messages (assuming a 'mensagens' table)
      const { count: mensagensCount, error: mensagensError } = await supabase.from('mensagens').select('count', { count: 'exact', head: true });
      if (!mensagensError) setTotalMensagens(mensagensCount || 0);

      // Fetch total cultos (assuming a 'cultos' table)
      const { count: cultosCount, error: cultosError } = await supabase.from('cultos').select('count', { count: 'exact', head: true });
      if (!cultosError) setTotalCultos(cultosCount || 0);

      setLoading(false);
    };
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-cyan-500/30 bg-slate-900/80 sticky top-0 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 text-slate-900 font-black grid place-items-center">iA</div>
            <h1 className="text-lg md:text-xl font-bold">Admin - TEFILIN v1</h1>
            <Pill>
              <span>"E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor" - Col 3:23</span>
            </Pill>
          </div>
          <div className="flex items-center gap-3">
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Configurar Sistema */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-white text-lg font-semibold">Configurar Sistema</h2>
              <p className="text-slate-400 text-sm">Edite nome da igreja, títulos e cores</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-slate-900 font-bold shadow-md shadow-cyan-500/30 hover:bg-cyan-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 3h4l1 3h3l1 4-3 1v2l3 1-1 4h-3l-1 3h-4l-1-3H6l-1-4 3-1v-2L5 10l1-4h3l1-3z"/></svg>
              CONFIGURAR
            </button>
          </div>
          {/* Tabs */}
          <div className="mt-4 overflow-x-auto">
            <nav className="flex gap-2 text-sm">
              {[
                { label: 'Home', path: '/admin' },
                { label: 'Visitantes', path: '/admin/visitantes' },
                { label: 'Users', path: '/admin/users' },
                { label: 'Cultos', path: '/admin/cultos' },
                { label: 'Msgs', path: '/admin/msgs' },
                { label: 'PDF', path: '/admin/pdf' },
                { label: 'API', path: '/admin/api' },
                { label: 'Backup', path: '/admin/backup' },
              ].map((tab) => (
                <Link
                  key={tab.label}
                  to={tab.path}
                  className={`px-3 py-1.5 rounded-lg border ${location.pathname === tab.path ? 'bg-slate-900 text-white border-cyan-500/40' : 'text-slate-300 border-slate-700 hover:border-cyan-500/30 hover:text-white'}`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <p>Carregando dados...</p>
          ) : (
            <>
              <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0z"/></svg>} value={totalVisitantes} label="Visitantes" />
              <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11V7a4 4 0 1 0-8 0v4H4v10h16V11zM10 7a2 2 0 1 1 4 0v4h-4z"/></svg>} value={totalUsuarios} label="Usuários" />
              <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v14H5.17L4 19.17V4zm3 3v2h10V7H7zm0 4v2h10v-2H7z"/></svg>} value={totalMensagens} label="Mensagens" />
              <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14v4H5zM3 9h18v12H3z"/></svg>} value={totalCultos} label="Cultos" />
            </>
          )}
          <div className="hidden md:block" />
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Status do Sistema">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Database</span>
                <Pill>Online</Pill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">WhatsApp Integration</span>
                <Pill>Conectado</Pill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Backup Automático</span>
                <Pill>Agendado</Pill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">PDF Generator</span>
                <Pill>Funcionando</Pill>
              </div>
            </div>
          </Section>
          <Section title="Atividade Recente">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2"/>
                <div>
                  <p className="text-slate-200">Sistema iniciado com sucesso</p>
                  <p className="text-slate-500 text-sm">Agora</p>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
      </main>
    </div>
  );
};

export default AdminDashboard;



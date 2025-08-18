import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, VisitanteRow } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
);

const Card: React.FC<{ title: string; children?: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white font-semibold">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">{children}</span>
);

const PastorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [visitantesHoje, setVisitantesHoje] = useState<VisitanteRow[]>([]);
  const [visitantesPendentes, setVisitantesPendentes] = useState<VisitanteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVisitantes, setTotalVisitantes] = useState(0);
  const [aguardandoVisita, setAguardandoVisita] = useState(0);
  const [visitados, setVisitados] = useState(0);
  const [novosMembros, setNovosMembros] = useState(0);

  useEffect(() => {
    const fetchVisitantes = async () => {
      setLoading(true);
      // Fetch visitantes for "Visitantes Chegaram Hoje" (e.g., created today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const { data: todayData, error: todayError } = await supabase
        .from('visitantes')
        .select('id, nome, tipo, telefone, status, created_at')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });

      if (todayError) {
        console.error('Erro ao carregar visitantes de hoje:', todayError);
      } else {
        setVisitantesHoje(todayData || []);
      }

      // Fetch visitantes for "Precisam de Visita Pastoral" (e.g., status 'Pendente')
      const { data: pendentesData, error: pendentesError } = await supabase
        .from('visitantes')
        .select('id, nome, tipo, telefone, status, created_at')
        .eq('status', 'Pendente') // Assuming a 'Pendente' status
        .order('created_at', { ascending: false });

      if (pendentesError) {
        console.error('Erro ao carregar visitantes pendentes:', pendentesError);
      } else {
        setVisitantesPendentes(pendentesData || []);
      }

      // Fetch counts for Stats
      const { count: totalCount, error: totalError } = await supabase
        .from('visitantes')
        .select('count', { count: 'exact', head: true });
      if (!totalError) setTotalVisitantes(totalCount || 0);

      const { count: aguardandoCount, error: aguardandoError } = await supabase
        .from('visitantes')
        .select('count', { count: 'exact', head: true })
        .eq('status', 'Aguardando Visita'); // Assuming 'Aguardando Visita' status
      if (!aguardandoError) setAguardandoVisita(aguardandoCount || 0);

      const { count: visitadosCount, error: visitadosError } = await supabase
        .from('visitantes')
        .select('count', { count: 'exact', head: true })
        .eq('status', 'Visitado'); // Assuming 'Visitado' status
      if (!visitadosError) setVisitados(visitadosCount || 0);

      const { count: novosMembrosCount, error: novosMembrosError } = await supabase
        .from('visitantes')
        .select('count', { count: 'exact', head: true })
        .eq('tipo', 'Novo Membro'); // Assuming 'Novo Membro' type
      if (!novosMembrosError) setNovosMembros(novosMembrosCount || 0);

      setLoading(false);
    };
    fetchVisitantes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-cyan-500/30 bg-slate-900/80 sticky top-0 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 text-slate-900 font-black grid place-items-center">iA</div>
            <h1 className="text-lg md:text-xl font-bold">Pastoral - TEFILIN v1</h1>
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-cyan-500/30 text-cyan-300 bg-cyan-500/10">"E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor" - Col 3:23</span>
          </div>
          <div className="flex items-center gap-3">
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <Stat label="Total Visitantes" value={totalVisitantes} />
          <Stat label="Aguardando Visita" value={aguardandoVisita} />
          <Stat label="Visitados" value={visitados} />
          <Stat label="Novos Membros" value={novosMembros} />
          <div className="hidden md:block" />
        </div>

        {/* Visitantes Chegaram Hoje */}
        <Card title="Visitantes Chegaram Hoje" right={<span className="text-slate-400 text-sm">Tempo Real</span>}>
          <div className="space-y-3">
            {loading ? (
              <p className="text-slate-400">Carregando visitantes de hoje...</p>
            ) : visitantesHoje.length === 0 ? (
              <p className="text-slate-400">Nenhum visitante chegou hoje.</p>
            ) : (
              visitantesHoje.map((v) => (
                <div key={v.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{v.nome}</span>
                      <Tag>{v.tipo}</Tag>
                    </div>
                    <div className="text-slate-400 text-sm">{new Date(v.created_at!).toLocaleDateString()}</div>
                  </div>
                  <div className="text-slate-400 text-sm mt-1">{v.telefone}</div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Precisam de Visita Pastoral */}
        <Card title="Precisam de Visita Pastoral" right={<button className="px-3 py-2 rounded-lg bg-cyan-400 text-slate-900 font-bold">WhatsApp Todos</button>}>
          <div className="space-y-3">
            {loading ? (
              <p className="text-slate-400">Carregando visitantes pendentes...</p>
            ) : visitantesPendentes.length === 0 ? (
              <p className="text-slate-400">Nenhum visitante pendente.</p>
            ) : (
              visitantesPendentes.map((v) => (
                <div key={v.id} className="rounded-lg border border-slate-700 p-4 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{v.nome}</span>
                    <Tag>{v.status}</Tag>
                  </div>
                  <div className="text-slate-400 text-sm">{v.tipo}</div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Grid inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card title="Visitas Recentes">
            {loading ? (
              <p className="text-slate-400">Carregando visitas recentes...</p>
            ) : (
              <p className="text-slate-400">Implementar fetching de visitas recentes</p>
            )}
          </Card>
          <Card title="Registrar Nova Visita">
            <div className="grid grid-cols-1 gap-3">
              <select className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700">
                <option>Selecione o visitante</option>
              </select>
              <select className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700">
                <option>Visita Presencial</option>
              </select>
              <input className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700" defaultValue="17/08/2025 18:00" />
              <textarea className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700" rows={4} placeholder="Descreva o que aconteceu na visita..." />
              <label className="inline-flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" /> Requer acompanhamento</label>
              <button className="px-3 py-2 rounded-lg bg-cyan-400 text-slate-900 font-bold w-max">Registrar Visita</button>
            </div>
          </Card>
        </div>

        <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
      </main>
    </div>
  );
};

export default PastorDashboard;



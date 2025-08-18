import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, VisitanteRow } from '../lib/supabaseClient';

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
    {children}
  </span>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({ children, className, colSpan }) => (
  <td className={`px-3 py-3 align-middle border-b border-slate-700/60 ${className ?? ''}`} colSpan={colSpan}>
    {children}
  </td>
);

const RecepcaoDashboard: React.FC = () => {
  const [rows, setRows] = useState<VisitanteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [newVisitante, setNewVisitante] = useState({
    nome: '',
    telefone: '',
    tipo: 'Cristão', // Default value
    status: 'Aguardando', // Default status for new visitors
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos os tipos');

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('visitantes')
      .select('id, nome, telefone, tipo, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    if (filterType !== 'Todos os tipos') {
      query = query.eq('tipo', filterType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao carregar visitantes:', error);
    } else {
      setRows(data || []);
    }

    setLoading(false);
  }, [searchTerm, filterType]); // Depend on searchTerm and filterType

  useEffect(() => {
    load();
  }, [load]); // Depend on load function

  const handleNewVisitanteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVisitante((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVisitante = async () => {
    if (!newVisitante.nome || !newVisitante.telefone) {
      alert('Nome e Telefone são obrigatórios!');
      return;
    }

    const { error } = await supabase.from('visitantes').insert([newVisitante]);

    if (error) {
      console.error('Erro ao adicionar visitante:', error);
      alert('Erro ao adicionar visitante.');
    } else {
      alert('Visitante adicionado com sucesso!');
      setNewVisitante({ nome: '', telefone: '', tipo: 'Cristão', status: 'Aguardando' }); // Clear form
      load(); // Call load directly to refresh the list
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-cyan-500/30 bg-slate-900/80 sticky top-0 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 text-slate-900 font-black grid place-items-center">iA</div>
            <h1 className="text-lg md:text-xl font-bold">Recepção - TEFILIN v1</h1>
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-cyan-500/30 text-cyan-300 bg-cyan-500/10">
              "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor" - Col 3:23
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-300 text-sm">recepcionista</span>
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
        {/* Cadastrar Visitante */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Cadastrar Visitante</h2>
              <p className="text-slate-400 text-sm">Registrar novo visitante - Comunicação apenas via WhatsApp</p>
            </div>
          </div>
          {/* Formulário de Cadastro */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="nome"
              value={newVisitante.nome}
              onChange={handleNewVisitanteChange}
              placeholder="Nome do Visitante"
              className="px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            />
            <input
              type="text"
              name="telefone"
              value={newVisitante.telefone}
              onChange={handleNewVisitanteChange}
              placeholder="Telefone (apenas números)"
              className="px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            />
            <select
              name="tipo"
              value={newVisitante.tipo}
              onChange={handleNewVisitanteChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option>Cristão</option>
              <option>Não Cristão</option>
              <option>Pregador</option>
              <option>Outro</option>
            </select>
            <button
              onClick={handleAddVisitante}
              className="px-3 py-2 rounded-lg bg-cyan-400 text-slate-900 font-bold shadow-md shadow-cyan-500/30 hover:bg-cyan-300 w-full"
            >
              Adicionar Visitante
            </button>
          </div>
        </div>

        {/* Lista de Visitantes */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
          <div className="flex items-center gap-3 mb-4">
            <input
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar visitantes..."
            />
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
              Todos os tipos
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">Telefone</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <TableCell colSpan={5} className="text-center text-slate-400">
                      Carregando visitantes...
                    </TableCell>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <TableCell colSpan={5} className="text-center text-slate-400">
                      Nenhum visitante encontrado
                    </TableCell>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id ?? i} className={i % 2 ? 'bg-slate-900/40' : ''}>
                      <TableCell>{r.nome || '-'}</TableCell>
                      <TableCell className="text-slate-300">{r.telefone || '-'}</TableCell>
                      <TableCell>
                        <Chip>{r.tipo || '—'}</Chip>
                      </TableCell>
                      <TableCell>
                        <Chip>{r.status || '—'}</Chip>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        <div className="flex items-center gap-3">
                          <button title="Editar" className="hover:text-cyan-300">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                            </svg>
                          </button>
                          <button title="WhatsApp" className="hover:text-cyan-300">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 3.5A10.5 10.5 0 0 0 3.5 20L2 22l2-.5A10.5 10.5 0 1 0 20 3.5zm-7 16a8.5 8.5 0 0 1-4.3-1.2L6 19l.7-2.6A8.6 8.6 0 1 1 13 19.5z" />
                            </svg>
                          </button>
                          <button title="Ver" className="hover:text-cyan-300">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="text-center text-cyan-400 text-xs mt-10">DEV EMERSON 2025</footer>
      </main>
    </div>
  );
};

export default RecepcaoDashboard;
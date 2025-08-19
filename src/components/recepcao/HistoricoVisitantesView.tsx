import React, { useState, useEffect, useCallback } from 'react';
import { supabase, VisitanteRow } from '../../lib/supabaseClient';

interface HistoricoVisitantesViewProps {
  onBack: () => void;
}

const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' }) => (
  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${color}`}>
    {children}
  </span>
);

const TableCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({ children, className, colSpan }) => (
  <td className={`px-3 py-3 align-middle border-b border-slate-700/60 ${className ?? ''}`} colSpan={colSpan}>
    {children}
  </td>
);

const HistoricoVisitantesView: React.FC<HistoricoVisitantesViewProps> = ({ onBack }) => {
  const [visitantes, setVisitantes] = useState<VisitanteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos os tipos');
  const [filterStatus, setFilterStatus] = useState('Todos os status');
  const [selectedVisitante, setSelectedVisitante] = useState<VisitanteRow | null>(null);

  const loadVisitantes = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('visitantes')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (searchTerm) {
      query = query.or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,congregacao_origem.ilike.%${searchTerm}%`);
    }

    if (filterType !== 'Todos os tipos') {
      query = query.eq('tipo', filterType);
    }

    if (filterStatus !== 'Todos os status') {
      query = query.eq('status', filterStatus);
    }

    try {
      const { data, error } = await query.limit(100);

      if (error) {
        throw error;
      }

      setVisitantes(data || []);
    } catch (error) {
      console.error('Erro ao carregar visitantes:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    loadVisitantes();
  }, [loadVisitantes]);

  const handleWhatsApp = (visitante: VisitanteRow) => {
    if (visitante.telefone) {
      const message = encodeURIComponent(`Olá ${visitante.nome}, paz do Senhor! Obrigado por nos visitar na Assembleia de Deus Vila Evangélica. Esperamos vê-lo novamente em breve!`);
      const whatsappUrl = `https://wa.me/55${visitante.telefone}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Visitado':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'Aguardando Visita':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'Pendente':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-300';
      case 'Novo Membro':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
      default:
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    }
  };

  const getTipoColor = (tipo?: string) => {
    switch (tipo) {
      case 'Não Cristão':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-300';
      case 'Pregador':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'Outro':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
      default:
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Filtros e Pesquisa */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Histórico de Visitantes</h2>
            <p className="text-slate-400 text-sm">Pesquise e filtre os visitantes cadastrados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Pesquisar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, telefone ou congregação..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filtrar por Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Todos os tipos">Todos os tipos</option>
              <option value="Cristão">Cristão</option>
              <option value="Não Cristão">Não Cristão</option>
              <option value="Pregador">Pregador</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filtrar por Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Todos os status">Todos os status</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Aguardando Visita">Aguardando Visita</option>
              <option value="Visitado">Visitado</option>
              <option value="Novo Membro">Novo Membro</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{visitantes.length}</div>
          <div className="text-slate-400 text-sm">Total Exibidos</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {visitantes.filter(v => v.status === 'Visitado').length}
          </div>
          <div className="text-slate-400 text-sm">Visitados</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {visitantes.filter(v => v.status === 'Aguardando Visita').length}
          </div>
          <div className="text-slate-400 text-sm">Aguardando Visita</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {visitantes.filter(v => v.status === 'Novo Membro').length}
          </div>
          <div className="text-slate-400 text-sm">Novos Membros</div>
        </div>
      </div>

      {/* Tabela de Visitantes */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Lista de Visitantes</h3>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
          >
            ← Voltar
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
                <th className="px-3 py-2 font-medium">Congregação</th>
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <TableCell colSpan={7} className="text-center text-slate-400">
                    Carregando visitantes...
                  </TableCell>
                </tr>
              ) : visitantes.length === 0 ? (
                <tr>
                  <TableCell colSpan={7} className="text-center text-slate-400">
                    Nenhum visitante encontrado
                  </TableCell>
                </tr>
              ) : (
                visitantes.map((visitante, i) => (
                  <tr key={visitante.id ?? i} className={i % 2 ? 'bg-slate-900/40' : ''}>
                    <TableCell className="font-medium">{visitante.nome || '-'}</TableCell>
                    <TableCell className="text-slate-300">{visitante.telefone || '-'}</TableCell>
                    <TableCell>
                      <Chip color={getTipoColor(visitante.tipo)}>{visitante.tipo || '—'}</Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(visitante.status)}>{visitante.status || '—'}</Chip>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {visitante.congregacao_origem || '-'}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {visitante.created_at ? new Date(visitante.created_at).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex items-center gap-2">
                        <button 
                          title="Ver detalhes"
                          onClick={() => setSelectedVisitante(visitante)}
                          className="hover:text-cyan-300"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" />
                          </svg>
                        </button>
                        <button 
                          title="WhatsApp"
                          onClick={() => handleWhatsApp(visitante)}
                          className="hover:text-green-400"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 3.5A10.5 10.5 0 0 0 3.5 20L2 22l2-.5A10.5 10.5 0 1 0 20 3.5zm-7 16a8.5 8.5 0 0 1-4.3-1.2L6 19l.7-2.6A8.6 8.6 0 1 1 13 19.5z" />
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

      {/* Modal de Detalhes */}
      {selectedVisitante && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Detalhes do Visitante</h3>
              <button
                onClick={() => setSelectedVisitante(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-sm">Nome:</span>
                <div className="text-white font-medium">{selectedVisitante.nome}</div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Telefone:</span>
                <div className="text-white">{selectedVisitante.telefone}</div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Tipo:</span>
                <div className="mt-1">
                  <Chip color={getTipoColor(selectedVisitante.tipo)}>{selectedVisitante.tipo}</Chip>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Status:</span>
                <div className="mt-1">
                  <Chip color={getStatusColor(selectedVisitante.status)}>{selectedVisitante.status}</Chip>
                </div>
              </div>
              {selectedVisitante.quem_acompanha && (
                <div>
                  <span className="text-slate-400 text-sm">Quem Acompanha:</span>
                  <div className="text-white">{selectedVisitante.quem_acompanha}</div>
                </div>
              )}
              {selectedVisitante.congregacao_origem && (
                <div>
                  <span className="text-slate-400 text-sm">Congregação de Origem:</span>
                  <div className="text-white">{selectedVisitante.congregacao_origem}</div>
                </div>
              )}
              {selectedVisitante.observacoes && (
                <div>
                  <span className="text-slate-400 text-sm">Observações:</span>
                  <div className="text-white text-sm">{selectedVisitante.observacoes}</div>
                </div>
              )}
              <div>
                <span className="text-slate-400 text-sm">Data de Cadastro:</span>
                <div className="text-white">
                  {selectedVisitante.created_at ? new Date(selectedVisitante.created_at).toLocaleString('pt-BR') : '-'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedVisitante(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 font-semibold hover:bg-slate-600"
              >
                Fechar
              </button>
              <button
                onClick={() => handleWhatsApp(selectedVisitante)}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HistoricoVisitantesView;

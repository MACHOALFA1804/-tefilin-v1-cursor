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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Voltar</span>
          </button>
          <div>
            <h1 className="text-white text-3xl font-bold">Histórico de Visitantes</h1>
            <p className="text-slate-400 text-lg mt-1">Visualizar e gerenciar visitantes cadastrados</p>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pesquisa */}
          <div className="md:col-span-2">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Pesquisar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, telefone ou congregação..."
              className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Filtro por Tipo */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            >
              <option value="Todos os tipos">Todos os tipos</option>
              <option value="Cristão">Cristão</option>
              <option value="Não Cristão">Não Cristão</option>
              <option value="Pregador">Pregador</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
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

      {/* Tabela de Visitantes */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-slate-400">Carregando visitantes...</div>
          </div>
        ) : visitantes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400">Nenhum visitante encontrado</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/60">
                <tr>
                  <th className="px-3 py-4 text-left text-slate-300 font-semibold border-b border-slate-600">
                    Nome
                  </th>
                  <th className="px-3 py-4 text-left text-slate-300 font-semibold border-b border-slate-600">
                    Telefone
                  </th>
                  <th className="px-3 py-4 text-left text-slate-300 font-semibold border-b border-slate-600">
                    Tipo
                  </th>
                  <th className="px-3 py-4 text-left text-slate-300 font-semibold border-b border-slate-600">
                    Status
                  </th>
                  <th className="px-3 py-4 text-left text-slate-300 font-semibold border-b border-slate-600">
                    Data Cadastro
                  </th>
                  <th className="px-3 py-4 text-center text-slate-300 font-semibold border-b border-slate-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {visitantes.map((visitante) => (
                  <tr key={visitante.id} className="hover:bg-slate-700/30 transition-colors">
                    <TableCell>
                      <div className="font-medium text-white">{visitante.nome}</div>
                      {visitante.quem_acompanha && (
                        <div className="text-xs text-slate-400">
                          Acompanhado por: {visitante.quem_acompanha}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-white">{formatPhone(visitante.telefone)}</div>
                    </TableCell>
                    <TableCell>
                      <Chip color={getTipoColor(visitante.tipo)}>
                        {visitante.tipo}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(visitante.status)}>
                        {visitante.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-300">{formatDate(visitante.created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleWhatsApp(visitante)}
                          className="p-2 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedVisitante(visitante)}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                          title="Ver Detalhes"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedVisitante && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 max-w-md w-full">
            <h3 className="text-white text-lg font-semibold mb-4">Detalhes do Visitante</h3>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-sm">Nome:</span>
                <div className="text-white">{selectedVisitante.nome}</div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Telefone:</span>
                <div className="text-white">{formatPhone(selectedVisitante.telefone)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Tipo:</span>
                <div className="text-white">{selectedVisitante.tipo}</div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Status:</span>
                <div className="text-white">{selectedVisitante.status}</div>
              </div>
              {selectedVisitante.quem_acompanha && (
                <div>
                  <span className="text-slate-400 text-sm">Acompanhado por:</span>
                  <div className="text-white">{selectedVisitante.quem_acompanha}</div>
                </div>
              )}
              {selectedVisitante.congregacao_origem && (
                <div>
                  <span className="text-slate-400 text-sm">Congregação:</span>
                  <div className="text-white">{selectedVisitante.congregacao_origem}</div>
                </div>
              )}
              {selectedVisitante.observacoes && (
                <div>
                  <span className="text-slate-400 text-sm">Observações:</span>
                  <div className="text-white">{selectedVisitante.observacoes}</div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedVisitante(null)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleWhatsApp(selectedVisitante);
                  setSelectedVisitante(null);
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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

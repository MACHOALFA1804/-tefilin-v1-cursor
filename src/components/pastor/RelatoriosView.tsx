import React, { useState, useEffect } from 'react';
import { supabase, VisitanteRow } from '../../lib/supabaseClient';

interface RelatoriosViewProps {
  onBack: () => void;
}

interface FiltrosRelatorio {
  dataInicio: string;
  dataFim: string;
  tipo: string;
  status: string;
  incluirDados: {
    informacoesPessoais: boolean;
    historico: boolean;
    estatisticas: boolean;
    graficos: boolean;
  };
}

const RelatoriosView: React.FC<RelatoriosViewProps> = ({ onBack }) => {
  const [visitantes, setVisitantes] = useState<VisitanteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    dataInicio: '',
    dataFim: '',
    tipo: 'Todos',
    status: 'Todos',
    incluirDados: {
      informacoesPessoais: true,
      historico: true,
      estatisticas: true,
      graficos: false
    }
  });

  const [previewData, setPreviewData] = useState<{
    total: number;
    porTipo: Record<string, number>;
    porStatus: Record<string, number>;
    porMes: Record<string, number>;
  } | null>(null);

  const loadPreviewData = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('visitantes')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros de data
      if (filtros.dataInicio) {
        query = query.gte('created_at', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        const dataFimAjustada = new Date(filtros.dataFim);
        dataFimAjustada.setHours(23, 59, 59, 999);
        query = query.lte('created_at', dataFimAjustada.toISOString());
      }

      // Aplicar filtros de tipo e status
      if (filtros.tipo !== 'Todos') {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros.status !== 'Todos') {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      setVisitantes(data || []);

      // Calcular estatísticas para preview
      if (data) {
        const porTipo: Record<string, number> = {};
        const porStatus: Record<string, number> = {};
        const porMes: Record<string, number> = {};

        data.forEach(visitante => {
          // Por tipo
          porTipo[visitante.tipo || 'Não informado'] = (porTipo[visitante.tipo || 'Não informado'] || 0) + 1;
          
          // Por status
          porStatus[visitante.status || 'Não informado'] = (porStatus[visitante.status || 'Não informado'] || 0) + 1;
          
          // Por mês
          if (visitante.created_at) {
            const mes = new Date(visitante.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            porMes[mes] = (porMes[mes] || 0) + 1;
          }
        });

        setPreviewData({
          total: data.length,
          porTipo,
          porStatus,
          porMes
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreviewData();
  }, [filtros.dataInicio, filtros.dataFim, filtros.tipo, filtros.status]);

  const handleFiltroChange = (campo: string, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleIncluirDadosChange = (campo: string) => {
    setFiltros(prev => ({
      ...prev,
      incluirDados: {
        ...prev.incluirDados,
        [campo]: !prev.incluirDados[campo as keyof typeof prev.incluirDados]
      }
    }));
  };

  const gerarRelatorioCSV = () => {
    if (visitantes.length === 0) {
      alert('Nenhum dado para gerar relatório!');
      return;
    }

    const headers = ['Nome', 'Telefone', 'Tipo', 'Status', 'Data de Cadastro'];
    const csvContent = [
      headers.join(','),
      ...visitantes.map(v => [
        `"${v.nome || ''}"`,
        `"${v.telefone || ''}"`,
        `"${v.tipo || ''}"`,
        `"${v.status || ''}"`,
        `"${v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-visitantes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gerarRelatorioPDF = async () => {
    setGerandoRelatorio(true);
    
    try {
      // Simular geração de PDF (aqui você integraria com uma biblioteca como jsPDF)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Por enquanto, vamos criar um HTML estruturado que pode ser impresso
      const relatorioHTML = gerarHTMLRelatorio();
      
      const novaJanela = window.open('', '_blank');
      if (novaJanela) {
        novaJanela.document.write(relatorioHTML);
        novaJanela.document.close();
        novaJanela.print();
      }
      
      alert('Relatório PDF preparado para impressão!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório PDF');
    } finally {
      setGerandoRelatorio(false);
    }
  };

  const gerarHTMLRelatorio = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Visitantes - ${dataAtual}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #22d3ee; font-weight: bold; font-size: 24px; }
            .subtitle { color: #64748b; margin-top: 5px; }
            .filters { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #22d3ee; }
            .stat-label { color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TEFILIN v1</div>
            <div class="subtitle">Assembleia de Deus Vila Evangélica</div>
            <h2>Relatório de Visitantes</h2>
            <p>Gerado em: ${dataAtual}</p>
          </div>

          ${filtros.incluirDados.estatisticas && previewData ? `
            <div class="filters">
              <strong>Filtros Aplicados:</strong><br>
              Período: ${filtros.dataInicio || 'Início'} até ${filtros.dataFim || 'Fim'}<br>
              Tipo: ${filtros.tipo} | Status: ${filtros.status}
            </div>

            <div class="stats">
              <div class="stat-card">
                <div class="stat-value">${previewData.total}</div>
                <div class="stat-label">Total de Visitantes</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${previewData.porTipo['Não Cristão'] || 0}</div>
                <div class="stat-label">Não Cristãos</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${previewData.porStatus['Aguardando Visita'] || 0}</div>
                <div class="stat-label">Aguardando Visita</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${previewData.porStatus['Visitado'] || 0}</div>
                <div class="stat-label">Visitados</div>
              </div>
            </div>
          ` : ''}

          ${filtros.incluirDados.informacoesPessoais ? `
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                ${visitantes.map(v => `
                  <tr>
                    <td>${v.nome || '-'}</td>
                    <td>${v.telefone || '-'}</td>
                    <td>${v.tipo || '-'}</td>
                    <td>${v.status || '-'}</td>
                    <td>${v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="footer">
            <p>"E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor" - Colossenses 3:23</p>
            <p>DEV EMERSON 2025</p>
          </div>
        </body>
      </html>
    `;
  };

  const definirPeriodoRapido = (dias: number) => {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - dias);
    
    setFiltros(prev => ({
      ...prev,
      dataInicio: inicio.toISOString().split('T')[0],
      dataFim: hoje.toISOString().split('T')[0]
    }));
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Geração de Relatórios</h2>
              <p className="text-slate-400 text-sm">Relatórios personalizados em PDF e CSV</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
          >
            ← Voltar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Relatório */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Filtros do Relatório</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Data Início</label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Visitante</label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Todos">Todos os tipos</option>
                  <option value="Cristão">Cristão</option>
                  <option value="Não Cristão">Não Cristão</option>
                  <option value="Pregador">Pregador</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Todos">Todos os status</option>
                  <option value="Aguardando">Aguardando</option>
                  <option value="Aguardando Visita">Aguardando Visita</option>
                  <option value="Visitado">Visitado</option>
                  <option value="Novo Membro">Novo Membro</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>
            </div>

            {/* Períodos Rápidos */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Períodos Rápidos</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Últimos 7 dias', dias: 7 },
                  { label: 'Últimos 30 dias', dias: 30 },
                  { label: 'Últimos 90 dias', dias: 90 },
                  { label: 'Último ano', dias: 365 }
                ].map(periodo => (
                  <button
                    key={periodo.dias}
                    onClick={() => definirPeriodoRapido(periodo.dias)}
                    className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
                  >
                    {periodo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dados a Incluir */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Dados a Incluir</h3>
            
            <div className="space-y-3">
              {[
                { key: 'informacoesPessoais', label: 'Informações Pessoais dos Visitantes', desc: 'Nome, telefone, tipo, status, data de cadastro' },
                { key: 'historico', label: 'Histórico de Visitas', desc: 'Dados das visitas realizadas e agendadas' },
                { key: 'estatisticas', label: 'Estatísticas Resumidas', desc: 'Totais, gráficos e análises dos dados' },
                { key: 'graficos', label: 'Gráficos e Visualizações', desc: 'Gráficos de crescimento e distribuição' }
              ].map(item => (
                <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.incluirDados[item.key as keyof typeof filtros.incluirDados]}
                    onChange={() => handleIncluirDadosChange(item.key)}
                    className="mt-1 rounded"
                  />
                  <div>
                    <div className="text-slate-200 font-medium">{item.label}</div>
                    <div className="text-slate-400 text-sm">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Botões de Geração */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Gerar Relatório</h3>
            
            <div className="flex gap-4">
              <button
                onClick={gerarRelatorioPDF}
                disabled={gerandoRelatorio || loading}
                className="flex-1 px-4 py-3 rounded-lg bg-purple-400 text-slate-900 font-bold shadow-md shadow-purple-500/30 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gerandoRelatorio ? 'Gerando PDF...' : '📄 Gerar PDF'}
              </button>
              
              <button
                onClick={gerarRelatorioCSV}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-emerald-400 text-slate-900 font-bold shadow-md shadow-emerald-500/30 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📊 Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Preview dos Dados */}
        <div className="space-y-6">
          {/* Resumo */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Preview dos Dados</h3>
            
            {loading ? (
              <div className="text-slate-400">Carregando...</div>
            ) : previewData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{previewData.total}</div>
                  <div className="text-slate-400 text-sm">Total de Visitantes</div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-slate-300 font-medium text-sm">Por Tipo:</h4>
                  {Object.entries(previewData.porTipo).map(([tipo, count]) => (
                    <div key={tipo} className="flex justify-between text-sm">
                      <span className="text-slate-400">{tipo}:</span>
                      <span className="text-slate-200">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-slate-300 font-medium text-sm">Por Status:</h4>
                  {Object.entries(previewData.porStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="text-slate-400">{status}:</span>
                      <span className="text-slate-200">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-400">Nenhum dado encontrado</div>
            )}
          </div>

          {/* Instruções */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
            <h4 className="text-white font-semibold mb-2">Instruções:</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Configure os filtros desejados</li>
              <li>• Selecione os dados a incluir</li>
              <li>• PDF: Para impressão e apresentações</li>
              <li>• CSV: Para análise em planilhas</li>
              <li>• Use períodos específicos para análises detalhadas</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RelatoriosView;

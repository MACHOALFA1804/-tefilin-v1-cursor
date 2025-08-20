import React, { useState, useEffect, useCallback } from 'react';
import { supabase, VisitanteRow, VisitaRow } from '../../lib/supabaseClient';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { reportService, ReportData, downloadPDF, downloadCSV } from '../../services/reportService';

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

  const gerarRelatorioCSV = async () => {
    if (visitantes.length === 0) {
      alert('Nenhum dado para gerar relatório!');
      return;
    }

    setGerandoRelatorio(true);
    
    try {
      const reportData: ReportData = {
        title: 'Relatório de Visitantes',
        subtitle: `Período: ${filtros.dataInicio ? format(new Date(filtros.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) : 'Início'} até ${filtros.dataFim ? format(new Date(filtros.dataFim), 'dd/MM/yyyy', { locale: ptBR }) : 'Fim'}`,
        period: {
          start: filtros.dataInicio ? new Date(filtros.dataInicio) : startOfMonth(subMonths(new Date(), 1)),
          end: filtros.dataFim ? new Date(filtros.dataFim) : endOfMonth(new Date())
        },
        data: visitantes,
        metadata: {
          totalRegistros: visitantes.length,
          filtrosAplicados: [
            filtros.tipo !== 'Todos' ? `Tipo: ${filtros.tipo}` : '',
            filtros.status !== 'Todos' ? `Status: ${filtros.status}` : ''
          ].filter(Boolean),
          geradoPor: 'Pastor Dashboard',
          dataGeracao: new Date()
        }
      };

      const csvContent = reportService.generateCSV(reportData, 'visitors');
      const filename = `relatorio_visitantes_${format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR })}.csv`;
      
      downloadCSV(csvContent, filename);
      alert('Relatório CSV gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar relatório CSV:', error);
      alert('Erro ao gerar relatório CSV');
    } finally {
      setGerandoRelatorio(false);
    }
  };

  const gerarRelatorioPDF = async () => {
    if (visitantes.length === 0) {
      alert('Nenhum dado para gerar relatório!');
      return;
    }

    setGerandoRelatorio(true);
    
    try {
      const reportData: ReportData = {
        title: 'Relatório de Visitantes',
        subtitle: `Período: ${filtros.dataInicio ? format(new Date(filtros.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) : 'Início'} até ${filtros.dataFim ? format(new Date(filtros.dataFim), 'dd/MM/yyyy', { locale: ptBR }) : 'Fim'}`,
        period: {
          start: filtros.dataInicio ? new Date(filtros.dataInicio) : startOfMonth(subMonths(new Date(), 1)),
          end: filtros.dataFim ? new Date(filtros.dataFim) : endOfMonth(new Date())
        },
        data: visitantes,
        metadata: {
          totalRegistros: visitantes.length,
          filtrosAplicados: [
            filtros.tipo !== 'Todos' ? `Tipo: ${filtros.tipo}` : '',
            filtros.status !== 'Todos' ? `Status: ${filtros.status}` : ''
          ].filter(Boolean),
          geradoPor: 'Pastor Dashboard',
          dataGeracao: new Date()
        }
      };

      const pdfBlob = await reportService.generateVisitorsReportPDF(reportData);
      const filename = `relatorio_visitantes_${format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR })}.pdf`;
      
      downloadPDF(pdfBlob, filename);
      alert('Relatório PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error);
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

  const [loading, setLoading] = useState(false);
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [dadosRelatorio, setDadosRelatorio] = useState<any>(null);
  const [configRelatorio, setConfigRelatorio] = useState({
    periodo: 'mes',
    tipo: 'completo',
    incluirGraficos: true,
    incluirEstatisticas: true
  });

  // Gerar relatório
  const gerarRelatorio = useCallback(async () => {
    try {
      setLoading(true);
      setRelatorioGerado(false);

      // Calcular período
      const hoje = new Date();
      let dataInicio = new Date();
      
      switch (configRelatorio.periodo) {
        case 'semana':
          dataInicio.setDate(hoje.getDate() - 7);
          break;
        case 'mes':
          dataInicio.setMonth(hoje.getMonth() - 1);
          break;
        case 'trimestre':
          dataInicio.setMonth(hoje.getMonth() - 3);
          break;
        case 'ano':
          dataInicio.setFullYear(hoje.getFullYear() - 1);
          break;
      }

      // Buscar dados
      const { data: visitantes, error: visitantesError } = await supabase
        .from('visitantes')
        .select('*')
        .gte('created_at', dataInicio.toISOString())
        .order('created_at', { ascending: false });

      if (visitantesError) throw visitantesError;

      const { data: visitas, error: visitasError } = await supabase
        .from('visitas')
        .select('*')
        .gte('data_agendada', dataInicio.toISOString())
        .order('data_agendada', { ascending: false });

      if (visitasError) throw visitasError;

      // Calcular estatísticas
      const estatisticas = {
        periodo: configRelatorio.periodo,
        dataInicio: dataInicio.toLocaleDateString('pt-BR'),
        dataFim: hoje.toLocaleDateString('pt-BR'),
        totalVisitantes: visitantes?.length || 0,
        novosMembros: visitantes?.filter(v => v.status === 'Novo Membro').length || 0,
        naoCristaos: visitantes?.filter(v => v.tipo === 'Não Cristão').length || 0,
        visitasAgendadas: visitas?.filter(v => v.status === 'Agendada').length || 0,
        visitasRealizadas: visitas?.filter(v => v.status === 'Realizada').length || 0,
        visitasCanceladas: visitas?.filter(v => v.status === 'Cancelada').length || 0,
        taxaConversao: visitantes && visitantes.length > 0 
          ? ((visitantes.filter(v => v.status === 'Novo Membro').length / visitantes.length) * 100).toFixed(1)
          : '0'
      };

      // Análise por tipo de visitante
      const analisePorTipo = visitantes?.reduce((acc: any, visitante) => {
        const tipo = visitante.tipo || 'Não informado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {}) || {};

      // Análise por status
      const analisePorStatus = visitantes?.reduce((acc: any, visitante) => {
        const status = visitante.status || 'Não informado';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Análise temporal (últimos 30 dias)
      const analiseTemporal = [];
      for (let i = 29; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];
        
        const visitantesDia = visitantes?.filter(v => 
          v.created_at?.startsWith(dataStr)
        ).length || 0;

        analiseTemporal.push({
          data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          quantidade: visitantesDia
        });
      }

      const relatorio = {
        estatisticas,
        analisePorTipo,
        analisePorStatus,
        analiseTemporal,
        visitantes: visitantes || [],
        visitas: visitas || [],
        configuracao: configRelatorio
      };

      setDadosRelatorio(relatorio);
      setRelatorioGerado(true);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setLoading(false);
    }
  }, [configRelatorio]);

  // Download do relatório (simulado)
  const downloadRelatorio = () => {
    if (!dadosRelatorio) return;

    const conteudo = `
RELATÓRIO PASTORAL - TEFILIN v1
Período: ${dadosRelatorio.estatisticas.dataInicio} a ${dadosRelatorio.estatisticas.dataFim}

ESTATÍSTICAS GERAIS:
- Total de Visitantes: ${dadosRelatorio.estatisticas.totalVisitantes}
- Novos Membros: ${dadosRelatorio.estatisticas.novosMembros}
- Não Cristãos: ${dadosRelatorio.estatisticas.naoCristaos}
- Taxa de Conversão: ${dadosRelatorio.estatisticas.taxaConversao}%

VISITAS:
- Agendadas: ${dadosRelatorio.estatisticas.visitasAgendadas}
- Realizadas: ${dadosRelatorio.estatisticas.visitasRealizadas}
- Canceladas: ${dadosRelatorio.estatisticas.visitasCanceladas}

ANÁLISE POR TIPO:
${Object.entries(dadosRelatorio.analisePorTipo).map(([tipo, quantidade]) => `- ${tipo}: ${quantidade}`).join('\n')}

ANÁLISE POR STATUS:
${Object.entries(dadosRelatorio.analisePorStatus).map(([status, quantidade]) => `- ${status}: ${quantidade}`).join('\n')}

Gerado em: ${new Date().toLocaleString('pt-BR')}
    `;

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_pastoral_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Relatórios e Análises</h2>
              <p className="text-slate-400 text-sm">Métricas e insights para o crescimento da igreja</p>
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

      {/* Configuração do Relatório */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <h3 className="text-white font-semibold mb-4">Configuração do Relatório</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
            <select
              value={configRelatorio.periodo}
              onChange={(e) => setConfigRelatorio(prev => ({ ...prev, periodo: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
            <select
              value={configRelatorio.tipo}
              onChange={(e) => setConfigRelatorio(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="completo">Relatório Completo</option>
              <option value="resumido">Relatório Resumido</option>
              <option value="visitantes">Apenas Visitantes</option>
              <option value="visitas">Apenas Visitas</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="incluirGraficos"
              checked={configRelatorio.incluirGraficos}
              onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirGraficos: e.target.checked }))}
              className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <label htmlFor="incluirGraficos" className="ml-2 text-sm text-slate-300">
              Incluir Gráficos
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="incluirEstatisticas"
              checked={configRelatorio.incluirEstatisticas}
              onChange={(e) => setConfigRelatorio(prev => ({ ...prev, incluirEstatisticas: e.target.checked }))}
              className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <label htmlFor="incluirEstatisticas" className="ml-2 text-sm text-slate-300">
              Incluir Estatísticas
            </label>
          </div>
        </div>
        
        <button
          onClick={gerarRelatorio}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Gerando...' : 'Gerar Relatório'}
        </button>
      </div>

      {/* Relatório Gerado */}
      {relatorioGerado && dadosRelatorio && (
        <div className="space-y-6">
          {/* Estatísticas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{dadosRelatorio.estatisticas.totalVisitantes}</div>
              <div className="text-blue-300 text-sm">Total Visitantes</div>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{dadosRelatorio.estatisticas.novosMembros}</div>
              <div className="text-green-300 text-sm">Novos Membros</div>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{dadosRelatorio.estatisticas.naoCristaos}</div>
              <div className="text-purple-300 text-sm">Não Cristãos</div>
            </div>
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{dadosRelatorio.estatisticas.taxaConversao}%</div>
              <div className="text-yellow-300 text-sm">Taxa Conversão</div>
            </div>
          </div>

          {/* Análise por Tipo */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Análise por Tipo de Visitante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(dadosRelatorio.analisePorTipo).map(([tipo, quantidade]) => (
                <div key={tipo} className="bg-slate-900/40 rounded-lg p-4 border border-slate-700">
                  <div className="text-2xl font-bold text-cyan-400">{quantidade as number}</div>
                  <div className="text-slate-300 text-sm">{tipo}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Análise por Status */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Análise por Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(dadosRelatorio.analisePorStatus).map(([status, quantidade]) => (
                <div key={status} className="bg-slate-900/40 rounded-lg p-4 border border-slate-700">
                  <div className="text-2xl font-bold text-emerald-400">{quantidade as number}</div>
                  <div className="text-slate-300 text-sm">{status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Análise Temporal */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
            <h3 className="text-white font-semibold mb-4">Evolução dos Últimos 30 Dias</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {dadosRelatorio.analiseTemporal.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-slate-400 mb-1">{item.data}</div>
                    <div 
                      className="w-8 bg-cyan-500/30 border border-cyan-500/50 rounded-t"
                      style={{ height: `${Math.max(item.quantidade * 4, 4)}px` }}
                      title={`${item.quantidade} visitantes`}
                    ></div>
                    <div className="text-xs text-slate-300 mt-1">{item.quantidade}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-4">
            <button
              onClick={downloadRelatorio}
              className="px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              📥 Download do Relatório
            </button>
            <button
              onClick={() => setRelatorioGerado(false)}
              className="px-6 py-3 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-colors"
            >
              🔄 Gerar Novo Relatório
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default RelatoriosView;

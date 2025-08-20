import React, { useState, useEffect, useCallback } from 'react';
import { supabase, VisitanteRow, VisitaRow } from '../../lib/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface RelatoriosViewProps {
  onBack: () => void;
}

const RelatoriosView: React.FC<RelatoriosViewProps> = ({ onBack }) => {
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

  // Gerar relatório em PDF
  const gerarRelatorioPDF = async () => {
    console.log('Iniciando geração de PDF...');
    
    if (!dadosRelatorio) {
      console.error('Dados do relatório não encontrados');
      alert('Gere um relatório primeiro antes de criar o PDF');
      return;
    }

    try {
      console.log('Dados do relatório:', dadosRelatorio);
      
      const doc = new jsPDF();
      console.log('Documento PDF criado');
      
      // Configurações do documento
      doc.setFont('helvetica');
      doc.setFontSize(20);
      
      // Título principal
      doc.setTextColor(34, 211, 238); // Cor cyan
      doc.text('TEFILIN v1 - Relatório Pastoral', 105, 20, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // Cor slate
      doc.text('Assembleia de Deus Vila Evangélica', 105, 30, { align: 'center' });
      
      // Informações do período
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Período: ${dadosRelatorio.estatisticas.dataInicio} a ${dadosRelatorio.estatisticas.dataFim}`, 20, 45);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 55);
      
      // Estatísticas principais
      doc.setFontSize(16);
      doc.setTextColor(34, 211, 238);
      doc.text('Estatísticas Principais', 20, 75);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const stats = [
        ['Total de Visitantes', dadosRelatorio.estatisticas.totalVisitantes.toString()],
        ['Novos Membros', dadosRelatorio.estatisticas.novosMembros.toString()],
        ['Não Cristãos', dadosRelatorio.estatisticas.naoCristaos.toString()],
        ['Taxa de Conversão', `${dadosRelatorio.estatisticas.taxaConversao}%`],
        ['Visitas Agendadas', dadosRelatorio.estatisticas.visitasAgendadas.toString()],
        ['Visitas Realizadas', dadosRelatorio.estatisticas.visitasRealizadas.toString()],
        ['Visitas Canceladas', dadosRelatorio.estatisticas.visitasCanceladas.toString()]
      ];
      
      console.log('Adicionando tabela de estatísticas...');
      (doc as any).autoTable({
        startY: 80,
        head: [['Métrica', 'Valor']],
        body: stats,
        theme: 'grid',
        headStyles: {
          fillColor: [34, 211, 238],
          textColor: [0, 0, 0],
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 11
        },
        margin: { left: 20, right: 20 }
      });
      
      // Análise por tipo
      if (Object.keys(dadosRelatorio.analisePorTipo).length > 0) {
        console.log('Adicionando análise por tipo...');
        const tipoData = Object.entries(dadosRelatorio.analisePorTipo).map(([tipo, quantidade]) => [tipo, (quantidade as number).toString()]);
        
        (doc as any).autoTable({
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Tipo de Visitante', 'Quantidade']],
          body: tipoData,
          theme: 'grid',
          headStyles: {
            fillColor: [34, 211, 238],
            textColor: [0, 0, 0],
            fontSize: 12,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 11
          },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Análise por status
      if (Object.keys(dadosRelatorio.analisePorStatus).length > 0) {
        console.log('Adicionando análise por status...');
        const statusData = Object.entries(dadosRelatorio.analisePorStatus).map(([status, quantidade]) => [status, (quantidade as number).toString()]);
        
        (doc as any).autoTable({
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Status', 'Quantidade']],
          body: statusData,
          theme: 'grid',
          headStyles: {
            fillColor: [34, 211, 238],
            textColor: [0, 0, 0],
            fontSize: 12,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 11
          },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Lista de visitantes (se configurado)
      if (configRelatorio.incluirEstatisticas && dadosRelatorio.visitantes.length > 0) {
        console.log('Adicionando lista de visitantes...');
        const visitantesData = dadosRelatorio.visitantes.slice(0, 20).map((v: any) => [
          v.nome || '-',
          v.telefone || '-',
          v.tipo || '-',
          v.status || '-',
          v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : '-'
        ]);
        
        (doc as any).autoTable({
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Nome', 'Telefone', 'Tipo', 'Status', 'Data Cadastro']],
          body: visitantesData,
          theme: 'grid',
          headStyles: {
            fillColor: [34, 211, 238],
            textColor: [0, 0, 0],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 9
          },
          margin: { left: 20, right: 20 }
        });
        
        if (dadosRelatorio.visitantes.length > 20) {
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.text(`* Mostrando apenas os primeiros 20 visitantes de ${dadosRelatorio.visitantes.length} total`, 20, (doc as any).lastAutoTable.finalY + 10);
        }
      }
      
      // Rodapé
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      console.log('Salvando PDF...');
      // Salvar o PDF
      const filename = `relatorio_pastoral_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      console.log('PDF gerado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Download do relatório em texto (mantido para compatibilidade)
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
                {dadosRelatorio.analiseTemporal.map((item: any, index: number) => (
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
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={gerarRelatorioPDF}
              className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              📄 Gerar PDF
            </button>
            <button
              onClick={downloadRelatorio}
              className="px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              📥 Download TXT
            </button>
            <button
              onClick={() => setRelatorioGerado(false)}
              className="px-6 py-3 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-colors flex items-center gap-2"
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

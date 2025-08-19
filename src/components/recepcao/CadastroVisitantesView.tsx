import React, { useState } from 'react';
import { supabase, VisitanteRow } from '../../lib/supabaseClient';

interface CadastroVisitantesViewProps {
  onBack: () => void;
}

const CadastroVisitantesView: React.FC<CadastroVisitantesViewProps> = ({ onBack }) => {
  const [visitante, setVisitante] = useState<Partial<VisitanteRow>>({
    nome: '',
    telefone: '',
    tipo: 'Cristão',
    status: 'Aguardando',
    quem_acompanha: '',
    congregacao_origem: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVisitante(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!visitante.nome || !visitante.telefone) {
      setMessage({ type: 'error', text: 'Nome e Telefone são campos obrigatórios!' });
      return;
    }

    // Validação do telefone (apenas números)
    const telefoneRegex = /^[0-9]+$/;
    if (!telefoneRegex.test(visitante.telefone || '')) {
      setMessage({ type: 'error', text: 'Telefone deve conter apenas números!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('visitantes')
        .insert([visitante]);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Visitante cadastrado com sucesso!' });
      
      // Limpar formulário após sucesso
      setVisitante({
        nome: '',
        telefone: '',
        tipo: 'Cristão',
        status: 'Aguardando',
        quem_acompanha: '',
        congregacao_origem: '',
        observacoes: ''
      });

    } catch (error: any) {
      console.error('Erro ao cadastrar visitante:', error);
      setMessage({ type: 'error', text: `Erro ao cadastrar visitante: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {/* Formulário de Cadastro */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-9 9a9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">Cadastrar Novo Visitante</h2>
            <p className="text-slate-400 text-sm">Preencha os dados do visitante abaixo</p>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos obrigatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={visitante.nome || ''}
                onChange={handleInputChange}
                placeholder="Digite o nome completo"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                name="telefone"
                value={visitante.telefone || ''}
                onChange={handleInputChange}
                placeholder="11999999999 (apenas números)"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
          </div>

          {/* Classificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Classificação *
              </label>
              <select
                name="tipo"
                value={visitante.tipo || 'Cristão'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                required
              >
                <option value="Cristão">Cristão</option>
                <option value="Não Cristão">Não Cristão</option>
                <option value="Pregador">Pregador</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status Inicial
              </label>
              <select
                name="status"
                value={visitante.status || 'Aguardando'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="Aguardando">Aguardando</option>
                <option value="Aguardando Visita">Aguardando Visita</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* Campos adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quem Acompanha
              </label>
              <input
                type="text"
                name="quem_acompanha"
                value={visitante.quem_acompanha || ''}
                onChange={handleInputChange}
                placeholder="Nome de quem trouxe o visitante"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Congregação de Origem
              </label>
              <input
                type="text"
                name="congregacao_origem"
                value={visitante.congregacao_origem || ''}
                onChange={handleInputChange}
                placeholder="De qual congregação vem"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={visitante.observacoes || ''}
              onChange={handleInputChange}
              placeholder="Informações adicionais sobre o visitante..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 font-semibold hover:bg-slate-600 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-cyan-400 text-slate-900 font-bold shadow-md shadow-cyan-500/30 hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Visitante'}
            </button>
          </div>
        </form>
      </div>

      {/* Instruções */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <h3 className="text-white font-semibold mb-2">Instruções:</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• Campos marcados com * são obrigatórios</li>
          <li>• O telefone deve conter apenas números (sem símbolos ou espaços)</li>
          <li>• Comunicação com visitantes será feita apenas via WhatsApp</li>
          <li>• Classifique corretamente o tipo de visitante para melhor acompanhamento</li>
        </ul>
      </div>
    </main>
  );
};

export default CadastroVisitantesView;

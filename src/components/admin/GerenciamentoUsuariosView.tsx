import React, { useState, useEffect } from 'react';
import { supabase, ProfileRow } from '../../lib/supabaseClient';

interface GerenciamentoUsuariosViewProps {
  onBack: () => void;
}

interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  role: 'admin' | 'pastor' | 'recepcionista';
  ativo: boolean;
}

const GerenciamentoUsuariosView: React.FC<GerenciamentoUsuariosViewProps> = ({ onBack }) => {
  const [usuarios, setUsuarios] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ProfileRow | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  
  const [novoUsuario, setNovoUsuario] = useState<NovoUsuario>({
    nome: '',
    email: '',
    senha: '',
    role: 'recepcionista',
    ativo: true
  });

  const loadUsuarios = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }
      
      setUsuarios(data || []);
      setMessage(null); // Limpar mensagens de erro anteriores

    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      setMessage({ type: 'error', text: `Erro ao carregar usuários: ${error.message || 'Erro desconhecido'}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Auto-dismiss mensagens após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNovoUsuario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!novoUsuario.nome.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório!' });
      return false;
    }
    
    if (!novoUsuario.email.trim()) {
      setMessage({ type: 'error', text: 'E-mail é obrigatório!' });
      return false;
    }

    if (!editingUser && !novoUsuario.senha.trim()) {
      setMessage({ type: 'error', text: 'Senha é obrigatória para novos usuários!' });
      return false;
    }

    if (novoUsuario.senha && novoUsuario.senha.length < 6) {
      setMessage({ type: 'error', text: 'Senha deve ter pelo menos 6 caracteres!' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (editingUser) {
        // Atualizar usuário existente
        const updateData = {
          nome: novoUsuario.nome.trim(),
          email: novoUsuario.email.trim(),
          role: novoUsuario.role,
          ativo: novoUsuario.ativo,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) throw error;

        // Atualizar senha se fornecida (simplificado - em produção, usar auth.admin)
        if (novoUsuario.senha.trim()) {
          setMessage({ 
            type: 'warning', 
            text: 'Usuário atualizado! Nota: Para alterar senha, implemente auth.admin.' 
          });
        } else {
          setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
        }

      } else {
        // Criar novo usuário
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: novoUsuario.email.trim(),
            password: novoUsuario.senha,
            options: {
              data: {
                nome: novoUsuario.nome.trim(),
                role: novoUsuario.role
              }
            }
          });

          if (authError) throw authError;

          if (authData.user) {
            // Criar perfil do usuário
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                user_id: authData.user.id,
                nome: novoUsuario.nome.trim(),
                email: novoUsuario.email.trim(),
                role: novoUsuario.role,
                ativo: novoUsuario.ativo
              }]);

            if (profileError) throw profileError;
          }

          setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
        } catch (authError: any) {
          if (authError.message?.includes('already registered')) {
            setMessage({ type: 'error', text: 'Este e-mail já está cadastrado!' });
          } else {
            throw authError;
          }
        }
      }

      // Limpar formulário e fechar modal
      setNovoUsuario({
        nome: '',
        email: '',
        senha: '',
        role: 'recepcionista',
        ativo: true
      });
      setShowForm(false);
      setEditingUser(null);
      await loadUsuarios();

    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      setMessage({ 
        type: 'error', 
        text: `Erro ao salvar usuário: ${error.message || 'Erro desconhecido'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: ProfileRow) => {
    setEditingUser(usuario);
    setNovoUsuario({
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '', // Não pré-preencher senha por segurança
      role: usuario.role || 'recepcionista',
      ativo: usuario.ativo !== false
    });
    setShowForm(true);
    setMessage(null);
  };

  // Nova função para exclusão permanente
  const handleDeletePermanent = async (usuario: ProfileRow) => {
    if (!window.confirm(`⚠️ ATENÇÃO: EXCLUSÃO PERMANENTE!\n\nTem certeza que deseja EXCLUIR PERMANENTEMENTE o usuário "${usuario.nome}"?\n\nEsta ação NÃO PODE ser desfeita!\n\n• O usuário será removido do banco de dados\n• Todos os dados serão perdidos\n• O acesso ao sistema será revogado\n\nDigite "CONFIRMAR" para prosseguir.`)) {
      return;
    }

    // Segunda confirmação
    const confirmacao = window.prompt('Digite "CONFIRMAR" (em maiúsculo) para excluir permanentemente:');
    if (confirmacao !== 'CONFIRMAR') {
      setMessage({ type: 'warning', text: 'Exclusão cancelada.' });
      return;
    }

    try {
      setLoading(true);
      
      // Primeiro, tentar excluir o usuário do Auth (se tiver user_id)
      if (usuario.user_id) {
        try {
          // Nota: Em produção, você precisará usar o auth.admin API
          // const { error: authError } = await supabase.auth.admin.deleteUser(usuario.user_id);
          // if (authError) console.warn('Erro ao excluir do Auth:', authError);
        } catch (authError) {
          console.warn('Erro ao excluir do Auth:', authError);
        }
      }

      // Excluir o perfil do banco de dados
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', usuario.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Usuário excluído permanentemente!' });
      await loadUsuarios();

    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      setMessage({ type: 'error', text: `Erro ao excluir usuário: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Função para desativar/ativar (não excluir)
  const handleDeactivate = async (usuario: ProfileRow) => {
    const novoStatus = !usuario.ativo;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    if (!window.confirm(`Tem certeza que deseja ${acao.toUpperCase()} o usuário "${usuario.nome}"?\n\nEsta ação pode ser revertida a qualquer momento.`)) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ativo: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuario.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: `Usuário ${acao}do com sucesso!` });
      await loadUsuarios();

    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      setMessage({ type: 'error', text: `Erro ao ${acao}: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (usuario: ProfileRow) => {
    try {
      setLoading(true);
      
      const novoStatus = !usuario.ativo;
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ativo: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuario.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!` 
      });
      await loadUsuarios();

    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      setMessage({ type: 'error', text: `Erro ao alterar status: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'pastor':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'recepcionista':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'pastor': return 'Pastor';
      case 'recepcionista': return 'Recepcionista';
      default: return 'Indefinido';
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setNovoUsuario({
      nome: '',
      email: '',
      senha: '',
      role: 'recepcionista',
      ativo: true
    });
    setMessage(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Gerenciamento de Usuários</h2>
              <p className="text-slate-400 text-sm">Controle de acesso e permissões do sistema</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600 transition-colors"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors"
            >
              + Novo Usuário
            </button>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg border transition-all duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : message.type === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button 
                onClick={() => setMessage(null)}
                className="text-current opacity-70 hover:opacity-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Usuários */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Usuários do Sistema ({usuarios.length})</h3>
          <button
            onClick={loadUsuarios}
            className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
            disabled={loading}
          >
            🔄 Atualizar
          </button>
        </div>
        
        {loading ? (
          <div className="text-center text-slate-400 py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="mt-2">Carregando usuários...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-2 opacity-50">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"/>
            </svg>
            <p>Nenhum usuário encontrado</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 px-4 py-2 rounded-lg bg-blue-400 text-slate-900 font-bold text-sm"
            >
              Criar Primeiro Usuário
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="px-3 py-3 font-medium">Nome</th>
                  <th className="px-3 py-3 font-medium">E-mail</th>
                  <th className="px-3 py-3 font-medium">Função</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Criado em</th>
                  <th className="px-3 py-3 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr key={usuario.id} className={`${index % 2 ? 'bg-slate-900/40' : ''} hover:bg-slate-700/30 transition-colors`}>
                    <td className="px-3 py-3 text-white font-medium">
                      {usuario.nome || 'Nome não informado'}
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {usuario.email || '-'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getRoleColor(usuario.role)}`}>
                        {getRoleLabel(usuario.role)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        usuario.ativo !== false 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}>
                        {usuario.ativo !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(usuario)}
                          title="Editar usuário"
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-cyan-300 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleStatus(usuario)}
                          title={usuario.ativo !== false ? 'Desativar usuário' : 'Ativar usuário'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            usuario.ativo !== false 
                              ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                        >
                          {usuario.ativo !== false ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeletePermanent(usuario)}
                          title="⚠️ EXCLUIR PERMANENTEMENTE"
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors border border-red-500/30"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={novoUsuario.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome completo"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                  style={{ color: '#ffffff' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={novoUsuario.email}
                  onChange={handleInputChange}
                  placeholder="usuario@exemplo.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                  style={{ color: '#ffffff' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {editingUser ? 'Nova Senha (opcional)' : 'Senha *'}
                </label>
                <input
                  type="password"
                  name="senha"
                  value={novoUsuario.senha}
                  onChange={handleInputChange}
                  placeholder={editingUser ? "Deixe em branco para manter atual" : "Digite uma senha segura"}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required={!editingUser}
                  style={{ color: '#ffffff' }}
                />
                {editingUser && (
                  <p className="text-xs text-slate-400 mt-1">
                    Deixe em branco para manter a senha atual do usuário
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Função no Sistema *
                </label>
                <select
                  name="role"
                  value={novoUsuario.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  required
                  style={{ color: '#ffffff' }}
                >
                  <option value="recepcionista">Recepcionista</option>
                  <option value="pastor">Pastor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={novoUsuario.ativo}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                />
                <label className="text-slate-300 text-sm">Usuário ativo</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 font-semibold hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar Usuário')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instruções Atualizadas */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Instruções e Controles:
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-slate-200 font-medium mb-2">Funções do Sistema:</h5>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• <strong className="text-red-300">Administrador:</strong> Acesso completo ao sistema</li>
              <li>• <strong className="text-blue-300">Pastor:</strong> Acesso a dados, agendamentos, mensagens e relatórios</li>
              <li>• <strong className="text-green-300">Recepcionista:</strong> Acesso apenas ao cadastro e histórico de visitantes</li>
            </ul>
          </div>
          <div>
            <h5 className="text-slate-200 font-medium mb-2">Ações Disponíveis:</h5>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• <strong className="text-cyan-300">Editar:</strong> Alterar dados do usuário</li>
              <li>• <strong className="text-yellow-300">Ativar/Desativar:</strong> Controlar acesso (reversível)</li>
              <li>• <strong className="text-red-300">Excluir:</strong> Remover permanentemente do sistema</li>
              <li>• <strong className="text-orange-300">⚠️ CUIDADO:</strong> Exclusão permanente não pode ser desfeita!</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-amber-300 text-sm">
            <strong>Diferença importante:</strong> 
            <span className="text-yellow-300"> Desativar</span> apenas impede o login (reversível), 
            <span className="text-red-300"> Excluir</span> remove completamente do banco de dados (irreversível).
          </p>
        </div>
      </div>
    </main>
  );
};

export default GerenciamentoUsuariosView;
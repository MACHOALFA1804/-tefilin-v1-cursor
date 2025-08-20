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

      if (error) throw error;
      setUsuarios(data || []);

    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNovoUsuario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoUsuario.nome || !novoUsuario.email || (!editingUser && !novoUsuario.senha)) {
      setMessage({ type: 'error', text: 'Nome, e-mail e senha são obrigatórios!' });
      return;
    }

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updateData: any = {
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          role: novoUsuario.role,
          ativo: novoUsuario.ativo,
          updated_at: new Date().toISOString()
        };

        // Se uma nova senha foi fornecida, atualizar a senha
        if (novoUsuario.senha.trim() && editingUser.user_id) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            editingUser.user_id,
            { password: novoUsuario.senha }
          );
          
          if (passwordError) {
            console.error('Erro ao atualizar senha:', passwordError);
            setMessage({ type: 'warning', text: 'Usuário atualizado, mas houve erro ao alterar a senha. Entre em contato com o suporte.' });
          } else {
            setMessage({ type: 'success', text: 'Usuário e senha atualizados com sucesso!' });
          }
        } else {
          setMessage({ type: 'success', text: 'Usuário atualizado com sucesso! (senha mantida)' });
        }

        // Atualizar perfil
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) throw error;

      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: novoUsuario.email,
          password: novoUsuario.senha,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Criar perfil do usuário
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              user_id: authData.user.id,
              nome: novoUsuario.nome,
              email: novoUsuario.email,
              role: novoUsuario.role,
              ativo: novoUsuario.ativo
            }]);

          if (profileError) throw profileError;
        }

        setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
      }

      // Limpar formulário
      setNovoUsuario({
        nome: '',
        email: '',
        senha: '',
        role: 'recepcionista',
        ativo: true
      });
      setShowForm(false);
      setEditingUser(null);
      loadUsuarios();

    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      setMessage({ type: 'error', text: `Erro ao salvar usuário: ${error.message}` });
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
  };

  const handleDelete = async (usuario: ProfileRow) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
      return;
    }

    try {
      // Primeiro desativar o usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ativo: false })
        .eq('id', usuario.id);

      if (profileError) throw profileError;

      // Se necessário, também remover da autenticação (requer admin API)
      // Por enquanto, apenas desativar o perfil
      
      setMessage({ type: 'success', text: 'Usuário desativado com sucesso!' });
      loadUsuarios();

    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      setMessage({ type: 'error', text: `Erro ao excluir usuário: ${error.message}` });
    }
  };

  const toggleStatus = async (usuario: ProfileRow) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ativo: !usuario.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuario.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Usuário ${!usuario.ativo ? 'ativado' : 'desativado'} com sucesso!` 
      });
      loadUsuarios();

    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      setMessage({ type: 'error', text: `Erro ao alterar status: ${error.message}` });
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

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11V7a4 4 0 1 0-8 0v4H4v10h16V11zM10 7a2 2 0 1 1 4 0v4h-4z"/>
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
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 text-sm font-semibold hover:bg-slate-600"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300"
            >
              + Novo Usuário
            </button>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : message.type === 'warning'
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Lista de Usuários */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-5">
        <h3 className="text-white font-semibold mb-4">Usuários do Sistema</h3>
        
        {loading ? (
          <div className="text-center text-slate-400 py-8">
            Carregando usuários...
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Nenhum usuário encontrado
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
                  <th className="px-3 py-3 font-medium">Data de Criação</th>
                  <th className="px-3 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr key={usuario.id} className={index % 2 ? 'bg-slate-900/40' : ''}>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          title="Editar usuário"
                          className="p-1 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-cyan-300"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleStatus(usuario)}
                          title={usuario.ativo !== false ? 'Desativar usuário' : 'Ativar usuário'}
                          className={`p-1 rounded-lg ${
                            usuario.ativo !== false 
                              ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                        >
                          {usuario.ativo !== false ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(usuario)}
                          title="Excluir usuário"
                          className="p-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
          <div className="bg-slate-800 rounded-xl border border-cyan-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  setNovoUsuario({
                    nome: '',
                    email: '',
                    senha: '',
                    role: 'recepcionista',
                    ativo: true
                  });
                }}
                className="text-slate-400 hover:text-white"
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  required
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              {!editingUser ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={novoUsuario.senha}
                    onChange={handleInputChange}
                    placeholder="Digite uma senha segura"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nova Senha (opcional)
                  </label>
                  <input
                    type="password"
                    name="senha"
                    value={novoUsuario.senha}
                    onChange={handleInputChange}
                    placeholder="Deixe em branco para manter a senha atual"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Deixe em branco para manter a senha atual do usuário
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Função no Sistema *
                </label>
                <select
                  name="role"
                  value={novoUsuario.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500/50"
                  required
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
                  className="rounded"
                />
                <label className="text-slate-300 text-sm">Usuário ativo</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 border border-slate-600 font-semibold hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-400 text-slate-900 font-bold shadow-md shadow-blue-500/30 hover:bg-blue-300"
                >
                  {editingUser ? 'Atualizar' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <h4 className="text-white font-semibold mb-2">Instruções:</h4>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• <strong>Administrador:</strong> Acesso completo ao sistema</li>
          <li>• <strong>Pastor:</strong> Acesso a dados, agendamentos, mensagens e relatórios</li>
          <li>• <strong>Recepcionista:</strong> Acesso apenas ao cadastro e histórico de visitantes</li>
          <li>• Usuários inativos não conseguem fazer login no sistema</li>
          <li>• Senhas são criptografadas automaticamente para segurança</li>
        </ul>
      </div>
    </main>
  );
};

export default GerenciamentoUsuariosView;
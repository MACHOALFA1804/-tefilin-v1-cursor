import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

const LoginDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('recepcionista@igreja.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authService = AuthService.getInstance();
      const result = await authService.login(email, password);

      if (!result.success) {
        setError(result.error || 'Erro no login');
        return;
      }

      if (result.user) {
        // Redirecionar baseado no papel do usuário
        switch (result.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'pastor':
            navigate('/pastor');
            break;
          case 'recepcionista':
            navigate('/recepcao');
            break;
          default:
            setError('Papel de usuário não reconhecido');
        }
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      setError('Erro inesperado durante o login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold">TEFILIN v1</h1>
          <p className="text-slate-400 text-lg mt-1">Sistema de Gestão de Visitantes</p>
        </div>

        {/* Card de Login */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-black/20 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-cyan-400 text-slate-900 font-black text-2xl grid place-items-center mx-auto mb-4">
              iA
            </div>
            <h2 className="text-white text-xl font-semibold">Acesso ao Sistema</h2>
            <p className="text-slate-400 text-sm mt-1">Faça login para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-slate-300 text-sm font-medium mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                style={{ color: '#ffffff' }}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-slate-300 text-sm font-medium mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                style={{ color: '#ffffff' }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-cyan-400 text-slate-900 font-bold shadow-md shadow-cyan-500/30 hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              "E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor"
            </p>
            <p className="text-cyan-400 text-xs mt-1">Colossenses 3:23</p>
          </div>
        </div>

        <footer className="text-center text-cyan-400 text-xs mt-8">DEV EMERSON 2025</footer>
      </div>
    </div>
  );
};

export default LoginDashboard;
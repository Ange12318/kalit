import React, { useState } from 'react';
import API_BASE_URL from '../config';
import { LogoIcon } from './Icons';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur authentification');
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#0d2d53] text-white rounded-lg p-3">
            <LogoIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenue</h1>
            <p className="text-sm text-gray-500">Connectez-vous pour continuer</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Identifiant</label>
            <input value={login} onChange={e => setLogin(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d2d53]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d2d53]" />
          </div>

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="flex-1 bg-[#0d2d53] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#0b2746] disabled:opacity-60">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Ou contactez l'administrateur si vous n'avez pas de compte.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

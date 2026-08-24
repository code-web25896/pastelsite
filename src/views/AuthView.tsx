import React, { useState } from 'react';
import { LockKeyhole, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

type Mode = 'login' | 'register' | 'forgot';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const apiUrl = (path: string) => `${API_URL}/${path.replace(/^\/+/, '')}`;

export const AuthView: React.FC<{ initialMode?: Mode }> = ({ initialMode = 'login' }) => {
  const { setCurrentUser, navigateTo, addToast } = useStore();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === 'forgot') {
      addToast('La reinitialisation par e-mail necessite la configuration SMTP du serveur.', 'info');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? 'auth/login' : 'auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, firstName, lastName };

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connexion impossible.');

      localStorage.setItem('espace_pastel_auth_token', data.token);
      setCurrentUser({
        ...data.user,
        phone: data.user.phone || '',
        addresses: [],
        createdAt: data.user.createdAt || new Date().toISOString(),
      });
      addToast(`Bienvenue ${data.user.firstName} !`, 'success');
      navigateTo(data.user.role === 'admin' ? { type: 'admin' } : { type: 'account' });
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erreur de connexion.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'login' ? 'Connexion' : mode === 'register' ? 'Creer mon compte' : 'Mot de passe oublie';

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8">
        <div className="w-12 h-12 rounded-2xl bg-[#8FD8C3]/30 text-[#0B1833] flex items-center justify-center mb-5">
          <ShieldCheck />
        </div>

        <h1 className="font-['Outfit'] font-black text-2xl text-[#0B1833]">{title}</h1>
        <p className="text-sm text-gray-500 mt-2">
          {mode === 'login'
            ? 'Accedez a votre espace client ou a l administration.'
            : mode === 'register'
              ? 'Les comptes crees sont des comptes clients.'
              : 'Saisissez votre adresse e-mail pour demander une reinitialisation.'}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold">
                Prenom
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 font-normal"
                />
              </label>
              <label className="text-xs font-bold">
                Nom
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 font-normal"
                />
              </label>
            </div>
          )}

          <label className="block text-xs font-bold">
            Adresse e-mail
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3"
                placeholder="vous@exemple.com"
              />
            </div>
          </label>

          {mode !== 'forgot' && (
            <label className="block text-xs font-bold">
              Mot de passe
              <div className="relative mt-1.5">
                <LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="password"
                  minLength={mode === 'register' ? 12 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3"
                  placeholder="••••••••••••"
                />
              </div>
              {mode === 'register' && (
                <span className="mt-1 block font-normal text-gray-500">
                  12 caracteres minimum, avec majuscule, minuscule et chiffre.
                </span>
              )}
            </label>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#0B1833] py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? 'Veuillez patienter...' : mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Creer mon compte' : 'Demander la reinitialisation'}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#0B1833]">
          <button onClick={() => setMode('login')}>Connexion</button>
          <button onClick={() => setMode('register')}>Inscription</button>
          <button onClick={() => setMode('forgot')}>Mot de passe oublie ?</button>
        </div>

        <button onClick={() => navigateTo({ type: 'home' })} className="mt-6 flex items-center gap-1.5 text-xs text-gray-500">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour a la boutique
        </button>
      </div>
    </div>
  );
};

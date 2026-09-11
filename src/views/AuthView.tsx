import React, { useState } from 'react';
import { LockKeyhole, Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

type Mode = 'login' | 'register' | 'forgot' | 'reset';
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const apiUrl = (path: string) => `${API_URL}/${path.replace(/^\/+/, '')}`;

export const AuthView: React.FC<{ initialMode?: Mode }> = ({ initialMode = 'login' }) => {
  const { setCurrentUser, navigateTo, addToast } = useStore();
  const initialToken = new URLSearchParams(window.location.search).get('token') || '';
  const [mode, setMode] = useState<Mode>(initialToken ? 'reset' : initialMode);
  const [resetToken, setResetToken] = useState(initialToken);
  const [resetSent, setResetSent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const response = await fetch(apiUrl('auth/forgot-password'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Impossible d’envoyer la demande.');
        setResetSent(true);
        if (data.resetToken) {
          setResetToken(data.resetToken);
          setMode('reset');
          window.history.replaceState({}, '', '/mot-de-passe-oublie?token=' + encodeURIComponent(data.resetToken));
        }
        return;
      }

      if (mode === 'reset') {
        if (!resetToken) throw new Error('Le lien de réinitialisation est invalide ou incomplet.');
        if (password.length < 12) throw new Error('Le nouveau mot de passe doit contenir au moins 12 caractères.');
        if (password !== confirmPassword) throw new Error('Les deux mots de passe ne correspondent pas.');
        const response = await fetch(apiUrl('auth/reset-password'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, newPassword: password }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Réinitialisation impossible.');
        addToast('Mot de passe réinitialisé. Vous pouvez vous connecter.', 'success');
        setPassword(''); setConfirmPassword(''); setResetToken(''); setMode('login');
        window.history.replaceState({}, '', '/connexion');
        return;
      }

      const endpoint = mode === 'login' ? 'auth/login' : 'auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, firstName, lastName };
      const response = await fetch(apiUrl(endpoint), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connexion impossible.');
      localStorage.setItem('espace_pastel_auth_token', data.token);
      setCurrentUser({ ...data.user, phone: data.user.phone || '', addresses: [], createdAt: data.user.createdAt || new Date().toISOString() });
      addToast(`Bienvenue ${data.user.firstName} !`, 'success');
      navigateTo(data.user.role === 'admin' ? { type: 'admin' } : { type: 'account' });
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Une erreur est survenue.', 'error');
    } finally { setLoading(false); }
  };

  const title = mode === 'login' ? 'Connexion' : mode === 'register' ? 'Créer mon compte' : mode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe oublié';
  const description = mode === 'login' ? 'Accédez à votre espace client.' : mode === 'register' ? 'Les comptes créés sont des comptes clients.' : mode === 'reset' ? 'Choisissez un nouveau mot de passe sécurisé pour votre compte.' : 'Saisissez votre adresse e-mail. Nous vous enverrons les instructions de réinitialisation.';

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8">
        <div className="w-12 h-12 rounded-2xl bg-[#8FD8C3]/30 text-[#0B1833] flex items-center justify-center mb-5"><ShieldCheck /></div>
        <h1 className="font-sans font-black text-2xl text-[#0B1833]">{title}</h1>
        <p className="text-sm text-gray-500 mt-2">{description}</p>

        {mode === 'forgot' && resetSent && (
          <div className="mt-6 rounded-2xl border border-[#8FD8C3]/50 bg-[#8FD8C3]/10 p-4 flex gap-3 text-[#0B1833]">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700" />
            <div><p className="font-bold text-sm">Demande envoyée</p><p className="mt-1 text-xs text-gray-600">Consultez votre boîte mail et cliquez sur le lien reçu pour choisir un nouveau mot de passe.</p></div>
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === 'register' && <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Prénom<input required value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 font-normal" /></label><label className="text-xs font-bold">Nom<input required value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 font-normal" /></label></div>}
          {mode !== 'reset' && <label className="block text-xs font-bold">Adresse e-mail<div className="relative mt-1.5"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" /><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3" placeholder="vous@exemple.com" /></div></label>}
          {mode !== 'forgot' && mode !== 'reset' && <label className="block text-xs font-bold">Mot de passe<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" /><input required type="password" minLength={mode === 'register' ? 12 : 1} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3" placeholder="••••••••••••" /></div>{mode === 'register' && <span className="mt-1 block font-normal text-gray-500">12 caractères minimum.</span>}</label>}
          {mode === 'reset' && <><label className="block text-xs font-bold">Nouveau mot de passe<input required type="password" minLength={12} value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 py-3 px-3" placeholder="12 caractères minimum" /></label><label className="block text-xs font-bold">Confirmer le mot de passe<input required type="password" minLength={12} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 py-3 px-3" placeholder="Retapez votre mot de passe" /></label></>}
          <button disabled={loading} className="w-full rounded-xl bg-[#0B1833] py-3.5 text-sm font-bold text-white disabled:opacity-60">{loading ? 'Veuillez patienter...' : mode === 'login' ? 'Se connecter' : mode === 'register' ? 'Créer mon compte' : mode === 'reset' ? 'Enregistrer le nouveau mot de passe' : 'Envoyer le lien de réinitialisation'}</button>
        </form>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#0B1833]"><button type="button" onClick={() => { setMode('login'); setResetSent(false); }}>Connexion</button><button type="button" onClick={() => { setMode('register'); setResetSent(false); }}>Inscription</button>{mode !== 'reset' && <button type="button" onClick={() => { setMode('forgot'); setResetSent(false); }}>Mot de passe oublié ?</button>}</div>
        <button type="button" onClick={() => navigateTo({ type: 'home' })} className="mt-6 flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0B1833]"><ArrowLeft className="w-3.5 h-3.5" />Retour à la boutique</button>
      </div>
    </div>
  );
};
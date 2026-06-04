import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { Car, Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(form.email, form.password);
        toast.success('Connecté !');
      } else if (mode === 'register') {
        await registerWithEmail(form.email, form.password, form.fullName);
        toast.success('Compte créé ! Vérifiez votre email.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setForgotSent(true);
        toast.success('Email envoyé !');
      }
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-5">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
          <Car className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">SpotCar</h1>
        <p className="text-zinc-500 text-sm mt-1">Repérez les voitures rares autour de vous</p>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {mode === 'forgot' ? (
          <>
            <button
              onClick={() => { setMode('login'); setForgotSent(false); }}
              className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <h2 className="text-white font-bold text-lg mb-1">Mot de passe oublié</h2>
            <p className="text-zinc-500 text-sm mb-5">
              Entrez votre email et on vous envoie un lien pour réinitialiser votre mot de passe.
            </p>
            {forgotSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-white font-medium">Email envoyé !</p>
                <p className="text-zinc-500 text-sm mt-1">Vérifiez votre boîte mail.</p>
                <button
                  onClick={() => { setMode('login'); setForgotSent(false); }}
                  className="mt-4 text-orange-500 hover:text-orange-400 text-sm underline"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer le lien'}
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    mode === m ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {m === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={form.fullName}
                    onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>

            {mode === 'login' && (
              <button
                onClick={() => setMode('forgot')}
                className="w-full text-center text-zinc-500 hover:text-orange-500 text-xs mt-4 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

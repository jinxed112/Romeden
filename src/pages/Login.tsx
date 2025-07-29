import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : 'Erreur de connexion. Veuillez réessayer.'
      );
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Veuillez saisir votre email');
      setLoading(false);
      return;
    }

    const { error } = await resetPassword(email);

    if (error) {
      setError('Erreur lors de l\'envoi. Vérifiez votre email.');
    } else {
      setResetSent(true);
    }

    setLoading(false);
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email envoyé !</h2>
            <p className="text-gray-600 mb-6">
              Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
            </p>
            <Button
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {resetMode ? 'Mot de passe oublié' : 'Administration'}
          </h1>
          <p className="text-gray-600">
            {resetMode 
              ? 'Saisissez votre email pour recevoir un lien de réinitialisation'
              : 'RomEden Events - Connexion admin'
            }
          </p>
        </div>

        <form onSubmit={resetMode ? handleResetPassword : handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="admin@romeden.com"
              required
              className="w-full"
            />
          </div>

          {!resetMode && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {resetMode ? 'Envoi...' : 'Connexion...'}
              </div>
            ) : (
              resetMode ? 'Envoyer le lien' : 'Se connecter'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setResetMode(!resetMode);
                setError('');
                setPassword('');
              }}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              {resetMode ? 'Retour à la connexion' : 'Mot de passe oublié ?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
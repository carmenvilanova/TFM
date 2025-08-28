import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Mail, Lock, User, Eye, EyeOff, UserCheck } from 'lucide-react';
import { AuthMode } from '../types/auth';
import { LanguageSelector } from './LanguageSelector';

interface AuthFormProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGuestLogin: () => void;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onModeChange,
  onLogin,
  onRegister,
  onGuestLogin,
  isLoading
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const result = await onLogin(formData.email, formData.password);
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
    } else if (mode === 'register') {
      const result = await onRegister(formData.name, formData.email, formData.password);
      if (!result.success) {
        setError(result.error || 'Error al registrarse');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-md animate-slide-in-left">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4 animate-bounce-gentle">
            <Building2 className="w-12 h-12 text-red-600 transition-transform-smooth hover:scale-110" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('app.title')}
          </h1>
          <p className="text-gray-600">
            Grupo TFM
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 hover-lift transition-all-smooth">
          {/* Mode Selector */}
          <div className="flex gap-1 p-1 bg-amber-100 rounded-lg mb-6 animate-fade-in">
            <button
              onClick={() => onModeChange('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all-smooth hover:scale-105 ${
                mode === 'login'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => onModeChange('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all-smooth hover:scale-105 ${
                mode === 'register'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-all-smooth" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all-smooth hover:border-amber-400"
                    placeholder={t('auth.name')}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-all-smooth" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all-smooth hover:border-amber-400"
                  placeholder={t('auth.email')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-all-smooth" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all-smooth hover:border-amber-400"
                  placeholder={t('auth.password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all-smooth hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all-smooth font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <span className="loading-dots">Procesando</span>
              ) : (
                mode === 'login' ? t('auth.login') : t('auth.register')
              )}
            </button>
          </form>

          {/* Guest Access */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onGuestLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-all-smooth font-medium flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <UserCheck className="w-5 h-5 transition-transform-smooth group-hover:scale-110" />
              {t('auth.guest')}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Acceso limitado sin registro
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© 2024 Grupo TFM</p>
          <p>Alex, Carmen, Camilo, Javier, Luis, Óscar</p>
        </div>
      </div>
    </div>
  );
};
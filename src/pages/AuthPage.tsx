import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, WifiOff } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'recovery';

interface AuthPageProps {
  connectionError?: string | null;
}

export default function AuthPage({ connectionError: initialConnectionError }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, resetPassword, connectionError: authConnectionError } = useAuth();
  const navigate = useNavigate();

  // Use either passed-in connection error or the one from auth context
  const connectionError = initialConnectionError || authConnectionError;

  // Clear form error when connection error appears
  useEffect(() => {
    if (connectionError) {
      setError(null);
    }
  }, [connectionError]);

  // Listen for password recovery event from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        setError(null);
        setSuccess(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          navigate('/today');
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email for a confirmation link!');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Password reset email sent! Check your inbox.');
        }
      } else if (mode === 'recovery') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Password updated successfully! Redirecting...');
          setTimeout(() => navigate('/today'), 1500);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center items-center p-4">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Guide</h1>
        <p className="text-gray-500 mt-1">AI-powered daily planning for young learners</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Tab Switcher (only for signin/signup) */}
        {mode !== 'forgot' && mode !== 'recovery' && (
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Back link for forgot password */}
        {mode === 'forgot' && (
          <button
            onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
          >
            &larr; Back to Sign In
          </button>
        )}

        {/* Recovery mode header */}
        {mode === 'recovery' && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Set New Password</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your new password below.</p>
          </div>
        )}

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
            <WifiOff className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-700">{connectionError}</p>
              <p className="text-xs text-orange-600 mt-1">You can still try to sign in below.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field (not for recovery mode) */}
          {mode !== 'recovery' && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          {/* Password Field (not for forgot mode) */}
          {(mode !== 'forgot') && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'recovery' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={mode === 'recovery' ? 'Enter new password' : 'Enter your password'}
                  required
                  autoComplete={mode === 'signup' || mode === 'recovery' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password Field (for signup and recovery) */}
          {(mode === 'signup' || mode === 'recovery') && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Forgot Password Link */}
          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Send Reset Email'}
            {mode === 'recovery' && 'Update Password'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-500">
        Personalized learning schedules powered by AI
      </p>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onNavigateHome }) => {
  const { customerLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (isSignUp && !fullName) {
      setError('Please provide your full name.');
      return;
    }

    try {
      setLoading(true);
      await customerLogin(email, fullName || email.split('@')[0]);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 pb-16 px-4 font-sans">
      
      {/* Brand Logo */}
      <div 
        onClick={onNavigateHome}
        className="cursor-pointer mb-6 text-center select-none"
      >
        <span className="font-black text-2xl tracking-tight text-[#131921]">
          SPINEL<span className="text-[#febd69]">.DISTRIBUTION</span>
        </span>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-[360px] border border-gray-300 rounded-lg p-7 shadow-sm bg-white">
        <h1 className="text-2xl font-normal text-gray-900 mb-4">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 p-2.5 rounded text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isSignUp && (
            <>
              <div>
                <label className="block font-bold text-gray-800 mb-1">Your name</label>
                <input
                  type="text"
                  placeholder="First and last name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-400 focus:border-[#e77600] rounded p-2 outline-none focus:ring-1 focus:ring-[#e77600]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Engineering / Security firm (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border border-gray-400 focus:border-[#e77600] rounded p-2 outline-none focus:ring-1 focus:ring-[#e77600]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-gray-800 mb-1">Email or enterprise ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-400 focus:border-[#e77600] rounded p-2 outline-none focus:ring-1 focus:ring-[#e77600]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Password</label>
            <input
              type="password"
              placeholder={isSignUp ? 'At least 6 characters' : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-400 focus:border-[#e77600] rounded p-2 outline-none focus:ring-1 focus:ring-[#e77600]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-semibold py-2 px-4 rounded border border-[#fcd200] shadow-sm cursor-pointer transition-colors text-xs mt-2"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create your Spinel account' : 'Sign in'}
          </button>
        </form>

        <p className="text-[11px] text-gray-600 mt-4 leading-relaxed">
          By continuing, you agree to Spinel Distribution's{' '}
          <span className="text-blue-700 hover:underline cursor-pointer">Conditions of Use</span> and{' '}
          <span className="text-blue-700 hover:underline cursor-pointer">Privacy Notice</span>.
        </p>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <span className="relative bg-white px-2 text-xs text-gray-500">
            {isSignUp ? 'Already have an account?' : 'New to Spinel Distribution?'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-4 rounded border border-gray-300 shadow-sm cursor-pointer transition-colors text-xs"
        >
          {isSignUp ? 'Sign in to existing account' : 'Create your Spinel account'}
        </button>

      </div>

      <div className="mt-8 text-xs text-gray-500 flex items-center gap-4">
        <span 
          onClick={onNavigateHome}
          className="text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft size={12} /> Back to Storefront
        </span>
      </div>

    </div>
  );
};

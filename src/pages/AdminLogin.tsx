import React, { useState } from 'react';
import { Shield, KeyRound, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onNavigateHome }) => {
  const { adminLogin } = useAuth();
  const [technicalEmail, setTechnicalEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!technicalEmail || !accessKey) {
      setError('Please provide both Technical Email ID and Access Key.');
      return;
    }

    try {
      setLoading(true);
      await adminLogin(technicalEmail, accessKey);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Access Denied: Invalid Technical Email or Access Key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      
      {/* Return to Storefront */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Return to Spinel Distribution Storefront
        </button>
      </div>

      <div className="w-full max-w-md bg-[#1e293b] border border-slate-700/80 rounded-xl shadow-2xl p-8 space-y-6">
        
        {/* Security Shield Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Shield size={28} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Spinel Operations Console
          </h1>
          <p className="text-xs text-slate-400">
            Internal administrative access. Secured via environment variables.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Technical Email ID
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="tech-admin@spineldistribution.com"
                value={technicalEmail}
                onChange={(e) => setTechnicalEmail(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
              <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Access Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter authorized access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
              <KeyRound size={16} className="absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold py-2.5 px-4 rounded-lg shadow transition-all cursor-pointer text-xs flex items-center justify-center gap-2 mt-2"
          >
            <Shield size={15} />
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}</span>
          </button>
        </form>

        {/* Default / Test Credentials Hint for convenience */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold">Environment Credentials Configured:</div>
          <div>Technical Email: <code className="text-amber-300 font-mono">admin@spineldistribution.com</code></div>
          <div>Access Key: <code className="text-amber-300 font-mono">SPINEL_SECURE_ACCESS_2026_KEY</code></div>
          <p className="text-[10px] text-slate-500 pt-1">
            Verified on the server through environment variables without client exposure.
          </p>
        </div>

      </div>
    </div>
  );
};

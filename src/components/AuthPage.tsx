import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  onNavigateHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { customerLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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
      setError('Please provide your full legal or corporate contact name.');
      return;
    }

    if (isSignUp && !phoneNumber) {
      setError('Please provide your corporate or mobile phone number.');
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
    <div className="py-12 px-4 flex flex-col items-center justify-center font-sans">
      {/* Official Spinel Distribution Logo */}
      <div className="mb-8 flex flex-col items-center text-center select-none">
        <img 
          src="https://res.cloudinary.com/bmv4hvtk/image/upload/v1788619290/Spinel_Distribution.jpg"
          alt="SPINEL DISTRIBUITION"
          className="h-16 w-auto object-contain rounded-lg bg-white p-2 shadow-md border border-gray-200"
          referrerPolicy="no-referrer"
        />
        <h2 className="mt-3 font-extrabold text-xl sm:text-2xl text-[#131921] tracking-tight uppercase">
          SPINEL DISTRIBUITION
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Enterprise Security, Networking &amp; Renewable Energy Portal
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md border border-gray-300 rounded-xl p-8 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create Enterprise Account' : 'Sign In'}
          </h1>
          <span className="p-2 rounded-full bg-amber-50 text-amber-600">
            <Lock size={20} />
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {isSignUp && (
            <>
              <div>
                <label className="block font-bold text-gray-800 mb-1.5 text-sm">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Engr. David Adeleke"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-300 focus:border-[#e77600] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#e77600]/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1.5 text-sm">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Integrated Systems Ltd."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full border border-gray-300 focus:border-[#e77600] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#e77600]/30 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1.5 text-sm">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +234 803 123 4567 or +1 (555) 019-2834"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border border-gray-300 focus:border-[#e77600] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#e77600]/30 transition-all"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-gray-800 mb-1.5 text-sm">Email Address</label>
            <input
              type="email"
              placeholder="corporate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 focus:border-[#e77600] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#e77600]/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1.5 text-sm">Password</label>
            <input
              type="password"
              placeholder={isSignUp ? 'At least 6 secure characters' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 focus:border-[#e77600] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#e77600]/30 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-gray-900 font-bold py-3 px-4 rounded-lg border border-[#fcd200] shadow-sm cursor-pointer transition-all text-sm sm:text-base"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create your Spinel account' : 'Sign in to Spinel Distribution'}
          </button>
        </form>

        <p className="text-xs text-gray-600 mt-5 leading-relaxed text-center">
          By continuing, you agree to Spinel Distribution's{' '}
          <span className="text-[#0066c0] hover:underline cursor-pointer font-medium">Conditions of Use</span> and{' '}
          <span className="text-[#0066c0] hover:underline cursor-pointer font-medium">Privacy Notice</span>.
        </p>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {isSignUp ? 'Already registered?' : 'New enterprise customer?'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg border border-gray-300 shadow-sm cursor-pointer transition-colors text-sm"
        >
          {isSignUp ? 'Sign in to existing account' : 'Create your Spinel account'}
        </button>
      </div>
    </div>
  );
};

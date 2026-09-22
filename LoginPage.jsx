import React, { useState } from 'react';
import { Sprout, ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, Sparkles, Zap, AlertTriangle, Info } from 'lucide-react';

/**
 * Modern, Fully Responsive Login Page Component
 * Featuring 2 Dedicated Sections (Farmer Portal & Admin Console) with Auto-Fill options for each
 */
export default function LoginPage({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('farmer'); // 'farmer' | 'admin'
  const [userId, setUserId] = useState('farmer');
  const [password, setPassword] = useState('farmer123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  // Demo Credentials for both sections
  const ROLES = {
    farmer: {
      id: 'farmer',
      password: 'farmer123',
      name: 'Farmer Portal',
      desc: 'Field Ops, Irrigation & Logs',
      color: 'emerald',
    },
    admin: {
      id: 'admin',
      password: 'admin123',
      altPassword: 'demo123',
      name: 'Admin Console',
      desc: 'Farm Config & Master P&L',
      color: 'amber',
    },
  };

  // Auto-Fill Handler for specific role
  const handleAutofill = (roleKey) => {
    setSelectedRole(roleKey);
    setUserId(ROLES[roleKey].id);
    setPassword(ROLES[roleKey].password);
    setErrorMessage('');
  };

  // Submit & Authentication Simulation Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const trimmedUser = userId.trim().toLowerCase();
      const trimmedPass = password.trim();

      const isFarmer = trimmedUser === ROLES.farmer.id && trimmedPass === ROLES.farmer.password;
      const isAdmin =
        trimmedUser === ROLES.admin.id &&
        (trimmedPass === ROLES.admin.password || trimmedPass === ROLES.admin.altPassword);

      if (isFarmer || isAdmin) {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess({
            userId: trimmedUser,
            role: isFarmer ? 'Farmer' : 'Administrator',
          });
        }
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid User ID or Password. Use the Auto-Fill buttons above.');
        setShake(true);
        setTimeout(() => setShake(false), 450);
      }
    }, 650);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b09] relative flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div
          className={`bg-[#0f1713]/90 border border-emerald-900/30 rounded-2xl p-7 shadow-2xl backdrop-blur-xl transition-transform ${
            shake ? 'animate-shake' : ''
          }`}
        >
          {/* Brand Header */}
          <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-zinc-800/80">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center border border-zinc-700 shadow-sm shrink-0">
              <Sprout className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-black tracking-tight leading-tight">
                <span className="text-emerald-400">Krushiratna</span>
                <span className="text-white ml-1.5">SaaS</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70 mt-0.5">
                Commercial Farm Management Portal
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-white tracking-tight">Sign In to Dashboard</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select your role section below to auto-fill or enter credentials manually.
            </p>
          </div>

          {/* 2 DISTINCT ROLE SECTIONS WITH AUTOFILL */}
          <div className="mb-4">
            <div className="text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase mb-2">
              Select Demo Role to Auto-Fill:
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Section 1: Farmer Portal */}
              <div
                onClick={() => handleAutofill('farmer')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'farmer'
                    ? 'bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                    : 'bg-[#121c17]/60 border-zinc-800/80 hover:border-emerald-700/50 hover:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">Farmer</div>
                    <div className="text-[10px] text-zinc-400 font-mono">farmer123</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAutofill('farmer');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Auto-Fill Farmer</span>
                </button>
              </div>

              {/* Section 2: Admin Console */}
              <div
                onClick={() => handleAutofill('admin')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'admin'
                    ? 'bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/30'
                    : 'bg-[#121c17]/60 border-zinc-800/80 hover:border-amber-700/50 hover:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">Admin</div>
                    <div className="text-[10px] text-zinc-400 font-mono">admin123</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAutofill('admin');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Auto-Fill Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* User ID / Email */}
            <div>
              <label htmlFor="userId" className="block text-xs font-semibold text-zinc-300 mb-1">
                User ID or Email
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. farmer or admin"
                  required
                  className="w-full bg-[#060a08] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <span className="text-[11px] text-emerald-400/80 hover:text-emerald-300 cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#060a08] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole === 'admin' ? 'Admin' : 'Farmer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Client-Friendly Helper Note */}
          <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-xs text-zinc-400 text-center">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              For client demo: click <strong className="text-emerald-400">Auto-Fill Farmer</strong> or{' '}
              <strong className="text-amber-400">Auto-Fill Admin</strong> above.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

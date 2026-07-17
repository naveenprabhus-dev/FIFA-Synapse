/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/user';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Landmark, Shield, User, Users, Lock, Sparkles, Mail, Eye, EyeOff, KeyRound, Info } from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'EMAIL_VERIFICATION_PENDING';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    loginBySimulatedRole,
    resetPassword,
    verifyEmail,
    user
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.FAN);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoadingRole, setQuickLoadingRole] = useState<UserRole | null>(null);

  // Read redirect path
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (mode === 'LOGIN') {
      if (!email || !password) {
        setError('Please enter your credentials to authenticate.');
        return;
      }
      setLoading(true);
      try {
        await loginWithEmail(email, password);
        navigate(from, { replace: true });
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Invalid email or password combination. Try a developer bypass below if you do not have an account.');
        } else {
          setError(err.message || 'Verification gate failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else if (mode === 'REGISTER') {
      if (!email || !password || !displayName) {
        setError('Please fill in all registration fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters for enterprise compliance.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        await registerWithEmail(email, password, displayName, selectedRole);
        setMode('EMAIL_VERIFICATION_PENDING');
        setInfoMessage('Account registered successfully! A secure verification link has been sent to your email.');
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          setError('This email address is already assigned to an operator profile.');
        } else {
          setError(err.message || 'Failed to construct operator profile.');
        }
      } finally {
        setLoading(false);
      }
    } else if (mode === 'FORGOT_PASSWORD') {
      if (!email) {
        setError('Please specify your registered email address.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setInfoMessage('A secure recovery key reset link has been dispatched to your email.');
        setMode('LOGIN');
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to dispatch reset key.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google Auth Provider initialization failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBypass = async (role: UserRole) => {
    setQuickLoadingRole(role);
    setError(null);
    setInfoMessage(null);
    try {
      await loginBySimulatedRole(role);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Simulated session authorization failed.');
    } finally {
      setQuickLoadingRole(null);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      await verifyEmail();
      setInfoMessage('Verification email has been resent to your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 uppercase">
            Access Control Gateway
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Secure authentication nodes for FIFA Synapse Stadium Systems
          </p>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {infoMessage && (
          <Alert variant="info" onClose={() => setInfoMessage(null)}>
            {infoMessage}
          </Alert>
        )}

        <Card className="bg-slate-900/40 border-slate-800 p-6 shadow-xl space-y-6">
          {mode === 'LOGIN' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Operator Email"
                placeholder="operator@synapse.fifa.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('FORGOT_PASSWORD')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-sans cursor-pointer"
                >
                  Forgot your password?
                </button>
                <button
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-sans cursor-pointer"
                >
                  Request new account
                </button>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs font-mono tracking-wider uppercase py-2"
                  isLoading={loading}
                  disabled={loading}
                >
                  Authenticate Session
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs font-mono tracking-wider uppercase py-2 flex items-center justify-center space-x-2 border-slate-700 hover:bg-slate-800"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sign In with Google</span>
                </Button>
              </div>
            </form>
          )}

          {mode === 'REGISTER' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Input
                id="displayName"
                type="text"
                label="Full Name / Handle"
                placeholder="e.g. Inspector Miller"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                required
              />

              <Input
                id="email"
                type="email"
                label="Operator Email Address"
                placeholder="e.g. miller@stadium.fifa.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    label="Confirm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Role Selection Segment */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Select Target Security Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: UserRole.FAN, title: 'Fan Access', desc: 'Stadium journey maps & wait times' },
                    { role: UserRole.ORGANIZER, title: 'Organizer', desc: 'Control heatmaps & dispatch overrides' },
                    { role: UserRole.OPERATIONS, title: 'Operations', desc: 'Incident dispatch & security' },
                    { role: UserRole.STAFF, title: 'Staff Seat', desc: 'Concessions & stock tracking' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedRole === r.role
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-200">{r.title}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-sans cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs font-mono tracking-wider uppercase py-2"
                  isLoading={loading}
                  disabled={loading}
                >
                  Register Security Credentials
                </Button>
              </div>
            </form>
          )}

          {mode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <KeyRound className="mx-auto w-8 h-8 text-blue-400" />
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Enter your registered operator email to receive a recovery key reset sequence.
                </p>
              </div>

              <Input
                id="email"
                type="email"
                label="Registered Email"
                placeholder="miller@stadium.fifa.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-sans cursor-pointer"
                >
                  Back to login
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs font-mono tracking-wider uppercase py-2"
                  isLoading={loading}
                  disabled={loading}
                >
                  Send Reset Sequence
                </Button>
              </div>
            </form>
          )}

          {mode === 'EMAIL_VERIFICATION_PENDING' && (
            <div className="space-y-4 text-center">
              <Mail className="mx-auto w-10 h-10 text-amber-400 animate-pulse" />
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-200 uppercase font-mono">
                  Verification Dispatch Success
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  We have dispatched a validation link to <span className="text-slate-200 font-semibold">{email}</span>. Please authorize this link before continuing.
                </p>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  className="w-full text-xs py-1.5 font-mono"
                  isLoading={loading}
                  disabled={loading}
                >
                  Resend Verification Email
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setMode('LOGIN')}
                  className="w-full text-xs py-1.5 font-mono"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          )}

          {/* Quick Simulated Bypass Section (Sandbox Mode) */}
          <div className="border-t border-slate-900 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                Quick Bypass Cockpit Modes
              </span>
              <Badge variant="warning" className="text-[8px] font-mono">
                DEVELOPER
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: UserRole.FAN, title: 'Fan', icon: User, style: 'hover:border-blue-500/30 hover:text-blue-400' },
                { role: UserRole.ORGANIZER, title: 'Organizer', icon: Landmark, style: 'hover:border-indigo-500/30 hover:text-indigo-400' },
                { role: UserRole.OPERATIONS, title: 'Operations', icon: Shield, style: 'hover:border-amber-500/30 hover:text-amber-400' },
                { role: UserRole.STAFF, title: 'Venue Staff', icon: Users, style: 'hover:border-emerald-500/30 hover:text-emerald-400' },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.role}
                    type="button"
                    onClick={() => handleQuickBypass(b.role)}
                    disabled={quickLoadingRole !== null || loading}
                    className={`flex items-center space-x-2 p-2 rounded-lg border border-slate-900/80 bg-slate-950/40 text-left text-xs text-slate-400 transition-all cursor-pointer ${b.style}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="font-semibold truncate">{b.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Logo } from "@/app/components/logo";

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  onGoogleSignIn: () => void;
}

export function AuthScreen({ onLogin, onSignUp, onGoogleSignIn }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      onSignUp(email, password);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8" style={{ backgroundColor: '#F7FAF9' }}>
      <div className="w-full max-w-[440px]">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4">
            <Logo size="large" showText={false} />
          </div>
          <h1 className="mb-2" style={{ fontSize: '24px', color: '#0F172A', textAlign: 'center' }}>
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </h1>
          <p style={{ color: '#475569', textAlign: 'center', fontSize: '15px' }}>
            {mode === 'login'
              ? 'Sign in to access your medications'
              : 'Create your account'}
          </p>
        </div>

        {/* Auth Form */}
        <div
          className="rounded-[18px] p-6 lg:p-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0px 8px 24px rgba(2, 6, 23, 0.08)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#475569' }} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 pl-10"
                  style={{ backgroundColor: 'white' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#475569' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
                  className="h-11 pl-10 pr-10"
                  style={{ backgroundColor: 'white' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" style={{ color: '#475569' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: '#475569' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#475569' }} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="h-11 pl-10"
                    style={{ backgroundColor: 'white' }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#FEE2E2', border: '1px solid #9F4A54' }}
              >
                <p style={{ fontSize: '14px', color: '#9F4A54' }}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11"
              style={{ backgroundColor: '#0F766E' }}
            >
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </Button>

            {/* Forgot Password (Login only) */}
            {mode === 'login' && (
              <button
                type="button"
                className="w-full text-center"
                style={{ color: '#0F766E', fontSize: '14px' }}
              >
                Forgot password?
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E6EAF0' }} />
            <span style={{ fontSize: '13px', color: '#475569' }}>or continue with</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E6EAF0' }} />
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={onGoogleSignIn}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border transition-colors hover:bg-gray-50"
            style={{
              borderColor: '#E6EAF0',
              backgroundColor: 'white',
              fontSize: '14px',
              fontWeight: 500,
              color: '#0F172A'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Toggle Mode */}
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#E6EAF0' }}>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setConfirmPassword('');
                }}
                style={{ color: '#0F766E', fontWeight: 600 }}
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

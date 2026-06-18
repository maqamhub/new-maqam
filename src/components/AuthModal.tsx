import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'signin' | 'signup';
  type?: 'khateeb' | 'masjid' | null;
}

export default function AuthModal({ isOpen, onOpenChange, defaultMode = 'signin', type = null }: AuthModalProps) {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMode(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { user, isNewUser, userData } = await loginWithGoogle(type);
      
      onOpenChange(false);

      if (isNewUser) {
        navigate('/signup');
      } else {
        if (userData?.account_type === 'masjid') {
          navigate('/masjid/portal');
        } else if (userData?.account_type === 'khateeb') {
          navigate('/khateeb/portal');
        } else {
          navigate('/signup');
        }
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed or blocked. If you are in the preview, try opening the app in a new tab (top right icon).');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, type);
        setSuccessMode(true);
      } else {
        const { isNewUser, userData } = await loginWithEmail(email, password);
        onOpenChange(false);
        if (isNewUser) {
          navigate('/signup');
        } else {
          if (userData?.account_type === 'masjid') {
            navigate('/masjid/portal');
          } else if (userData?.account_type === 'khateeb') {
            navigate('/khateeb/portal');
          } else {
            navigate('/signup');
          }
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (successMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] text-center p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-2">
              <CheckCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black text-parchment">Check your email</DialogTitle>
            <DialogDescription className="text-center text-parchment/60 pb-6">
              {mode === 'forgot_password' 
                ? `We've sent a password reset link to ${email}.`
                : `We've sent a confirmation link to ${email}. You can now proceed to your dashboard.`}
            </DialogDescription>
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-white/20 hover:bg-white/5 hover:border-gold text-parchment font-bold uppercase tracking-[0.1em] text-[10px] py-6 rounded-none"
              onClick={() => {
                if (mode === 'forgot_password') {
                  setSuccessMode(false);
                  setMode('signin');
                } else {
                  onOpenChange(false);
                  if (type === 'masjid') navigate('/masjid/portal');
                  else navigate('/khateeb/portal');
                }
              }}
            >
              {mode === 'forgot_password' ? 'Back to Sign In' : 'Go to Dashboard'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="mb-4 text-center items-center">
          <DialogTitle className="text-2xl uppercase tracking-tighter">
            {mode === 'signin' ? 'Welcome Back' : mode === 'forgot_password' ? 'Reset Password' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'signin' 
              ? 'Sign in to access your Maqam dashboard.' 
              : mode === 'forgot_password'
              ? 'Enter your email to receive a password reset link.'
              : 'Join the premier network for Jumu\'ah connections.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={mode === 'forgot_password' ? handleForgotPassword : handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-parchment/60 pl-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-forest-light/40 border border-white/10 px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          {mode !== 'forgot_password' && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-parchment/60 pl-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-forest-light/40 border border-white/10 px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}
          
          {mode === 'signin' && (
            <div className="flex justify-end mt-1 mb-3">
              <button
                type="button"
                onClick={() => setMode('forgot_password')}
                className="text-[10px] text-parchment/60 hover:text-gold uppercase tracking-wider"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-[0.2em] text-[10px] py-6 rounded-none mt-2"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'forgot_password' ? 'Send Link' : 'Sign Up'}
          </Button>
        </form>

        {mode !== 'forgot_password' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-forest px-2 text-parchment/40">Or</span>
              </div>
            </div>

            <div className="space-y-3">
          <Button 
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            variant="outline" 
            className="w-full bg-transparent border-white/20 hover:bg-white/5 hover:border-gold text-parchment font-bold uppercase tracking-[0.1em] text-[10px] py-6 rounded-none flex items-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="mt-6 text-center text-[10px] uppercase font-bold tracking-widest text-parchment/60">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              if (mode === 'signin') {
                onOpenChange(false);
                navigate('/signup');
              } else {
                setMode('signin');
              }
            }}
            className="text-gold hover:text-gold-light"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        </>
      )}
      {mode === 'forgot_password' && (
        <div className="mt-6 text-center text-[10px] uppercase font-bold tracking-widest text-parchment/60">
          Remember your password?{' '}
          <button 
            type="button"
            onClick={() => setMode('signin')}
            className="text-gold hover:text-gold-light"
          >
            Sign In
          </button>
        </div>
      )}
      </DialogContent>
    </Dialog>
  );
}

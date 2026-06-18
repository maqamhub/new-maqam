import React, { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { Bookmark, Sparkles, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authType, setAuthType] = useState<'khateeb' | 'masjid' | null>(null);
  
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getWelcomeMessage = () => {
    if (!user) return '';
    const displayName = userData?.name || user.displayName || user.email?.split('@')[0] || 'User';
    if (userData?.account_type === 'masjid') {
      return `Welcome Masjid ${displayName}`;
    }
    return `Welcome Imam ${displayName}`;
  };

  const navigateToDashboard = () => {
    if (userData?.account_type === 'masjid') {
      navigate('/masjid/portal');
    } else {
      navigate('/khateeb/portal');
    }
  };

  const openAuth = (mode: 'signin' | 'signup', type: 'khateeb' | 'masjid' | null = null) => {
    setAuthMode(mode);
    setAuthType(type);
    setAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-forest/80 backdrop-blur-xl border-b border-parchment/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <div className="flex-shrink-0 flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-forest-light rounded-none flex items-center justify-center text-gold border border-gold/20 hover:border-gold/50 transition-colors">
                <Bookmark size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-3xl text-parchment tracking-tight leading-none uppercase">
                  Maqam
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold mt-1.5">
                  Jumu'ah Connection
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <a
              href="/#booking"
              className="text-xs font-bold uppercase tracking-widest text-parchment/70 hover:text-gold transition-colors"
            >
              See How It Works
            </a>
            {!loading && user ? (
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                  {getWelcomeMessage()}
                </span>
                <button
                  onClick={navigateToDashboard}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-parchment hover:text-gold transition-colors"
                >
                  <UserIcon size={14} />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-parchment/50 hover:text-red-400 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            ) : (
              !loading && (
                <>
                  <button
                    onClick={() => openAuth('signin', 'khateeb')}
                    className="text-xs font-bold uppercase tracking-widest text-parchment/70 hover:text-gold transition-colors cursor-pointer"
                  >
                    Imam Login
                  </button>
                  <button
                    onClick={() => openAuth('signin', 'masjid')}
                    className="bg-gold hover:bg-gold-light text-forest px-6 py-3 rounded-none text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(167,68,75,0.2)] hover:shadow-[0_0_30px_rgba(231,111,81,0.4)] cursor-pointer"
                  >
                    Masjid Login
                  </button>
                </>
              )
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-parchment/70 hover:text-gold transition-colors p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-forest border-t border-white/5 absolute w-full left-0 top-24">
          <div className="px-4 py-2 shadow-xl">
            {user ? (
              <>
                <div className="py-4 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-gold text-right">
                  {getWelcomeMessage()}
                </div>
                <button
                  onClick={() => {
                    navigateToDashboard();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-right text-xs font-bold uppercase tracking-widest text-parchment hover:text-gold transition-colors py-4 border-b border-white/5"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-right text-xs font-bold uppercase tracking-widest text-red-400/80 hover:text-red-400 transition-colors py-4"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth('signin', 'masjid')}
                  className="block w-full text-right text-xs font-bold uppercase tracking-widest text-parchment hover:text-gold transition-colors py-4 border-b border-white/5"
                >
                  Masjid Login
                </button>
                <button
                  onClick={() => openAuth('signin', 'khateeb')}
                  className="block w-full text-right text-xs font-bold uppercase tracking-widest text-parchment hover:text-gold transition-colors py-4"
                >
                  Imam Login
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode={authMode} 
        type={authType} 
      />
    </nav>
  );
}

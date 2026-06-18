import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, User, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AddressAutocomplete } from '../components/ui/AddressAutocomplete';

export default function Signup() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'khateeb' | 'masjid' | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'type' | 'details'>('type');
  const [nameInput, setNameInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkState = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().account_type) {
        const type = docSnap.data().account_type;
        const missingName = !docSnap.data().name;
        const missingAddress = type === 'masjid' && !docSnap.data().address;
        
        if (missingName || missingAddress) {
          setAuthType(type);
          setOnboardingStep('details');
          setLoading(false);
        } else {
          navigate(type === 'masjid' ? '/masjid/portal' : '/khateeb/portal');
        }
      } else {
        setOnboardingStep('type');
        setLoading(false);
      }
    };
    checkState();
  }, [user, navigate]);

  const handleSignupClick = async (type: 'khateeb' | 'masjid') => {
    if (user) {
      setAuthType(type);
      setOnboardingStep('details');
    } else {
      setAuthType(type);
      setAuthModalOpen(true);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nameInput.trim() || !authType) return;
    if (authType === 'masjid' && !addressInput.trim()) return;
    
    setLoading(true);
    const userRef = doc(db, 'users', user.uid);
    const dataToUpdate: any = {
      account_type: authType,
      name: nameInput.trim(),
      email: user.email,
      created_at: new Date().toISOString()
    };
    
    if (authType === 'masjid') {
      dataToUpdate.address = addressInput.trim();
    }
    
    await setDoc(userRef, dataToUpdate, { merge: true });
    navigate(authType === 'masjid' ? '/masjid/portal' : '/khateeb/portal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest font-sans selection:bg-gold/30 selection:text-gold-light flex flex-col pt-10">
      <div className="w-full max-w-7xl mx-auto px-6 mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-parchment/60 hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        <div className="text-center mb-12">
          <Link to="/" className="font-black text-4xl tracking-tighter text-parchment inline-block mb-4 uppercase">Maqam</Link>
          <h1 className="text-2xl md:text-3xl font-black text-parchment tracking-tight">
            {onboardingStep === 'type' ? 'Join the Network' : 'Complete Profile'}
          </h1>
          <p className="text-parchment/60 mt-3 font-medium">
            {onboardingStep === 'type' ? 'Select your account type to continue' : `Enter your ${authType === 'masjid' ? 'organization details' : 'full name'}`}
          </p>
        </div>

        {onboardingStep === 'type' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mx-auto animate-slide-up">
            {/* Khateeb Option */}
            <button onClick={() => handleSignupClick('khateeb')} className="glass-card p-10 border border-parchment/10 hover:border-gold/50 hover:bg-gold/5 transition-all text-center group cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 bg-forest-light rounded-full flex items-center justify-center border border-white/10 group-hover:border-gold/30 group-hover:text-gold text-parchment/70 mb-6 transition-colors shadow-lg">
                <User size={32} />
              </div>
              <h2 className="text-2xl font-black text-parchment mb-3 tracking-tighter">I am a Scholar / Khateeb</h2>
              <p className="text-parchment/60 text-sm leading-relaxed mb-8 flex-1">
                Join the directory to receive invitations, manage your availability, and connect with mosques seeking verified speakers.
              </p>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold border border-gold/30 px-6 py-3 bg-gold/5 group-hover:bg-gold group-hover:text-forest transition-colors w-full sm:w-auto">
                Create Scholar Profile
              </span>
            </button>

            {/* Masjid Option */}
            <button onClick={() => handleSignupClick('masjid')} className="glass-card p-10 border border-white/10 hover:border-gold/50 hover:bg-gold/5 transition-all text-center group cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 bg-forest-light rounded-full flex items-center justify-center border border-white/10 group-hover:border-gold/30 group-hover:text-gold text-parchment/70 mb-6 transition-colors shadow-lg">
                <Building size={32} />
              </div>
              <h2 className="text-2xl font-black text-parchment mb-3 tracking-tighter">We are an Organization</h2>
              <p className="text-parchment/60 text-sm leading-relaxed mb-8 flex-1">
                Post Jumu'ah slots, access a verified directory of local scholars, and securely schedule confident khutbahs for your community.
              </p>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold border border-gold/30 px-6 py-3 bg-gold/5 group-hover:bg-gold group-hover:text-forest transition-colors w-full sm:w-auto">
                Register Organization
              </span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveDetails} className="max-w-md w-full glass-card p-8 border border-white/10 animate-fade-in">
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-parchment/60 mb-2">
                {authType === 'masjid' ? 'Masjid / Organization Name' : 'Full Name'}
              </label>
              <input 
                type="text" 
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                className="w-full bg-forest-light/40 border-b border-parchment/20 text-parchment px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                placeholder={authType === 'masjid' ? 'e.g. Islamic Center of NY' : 'e.g. Imam John Doe'}
              />
            </div>
            {authType === 'masjid' && (
              <div className="mb-8">
                <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-parchment/60 mb-2">
                  Full Address
                </label>
                <AddressAutocomplete 
                  value={addressInput}
                  onChange={setAddressInput}
                  required={true}
                  className="w-full bg-forest-light/40 border-b border-parchment/20 text-parchment px-4 py-3 focus:outline-none focus:border-gold transition-colors placeholder:text-parchment/30"
                  placeholder="Start typing your full address..."
                />
              </div>
            )}
            <button 
              type="submit" 
              className="w-full bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-[0.2em] text-[10px] py-4 transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              Continue <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode="signup" 
        type={authType} 
      />
    </div>
  );
}

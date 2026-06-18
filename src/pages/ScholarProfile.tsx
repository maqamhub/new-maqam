import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, UserCheck, Calendar, BookOpen, MessageSquare, Link as LinkIcon, Share2, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { format } from 'date-fns';
import { useUsers } from '../hooks/useUsers';

export default function ScholarProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [hadiyyaAmount, setHadiyyaAmount] = useState('');
  const { users } = useUsers('khateeb');
  
  const scholar = users.find(u => u.name === decodeURIComponent(id || '') || u.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scholarName = scholar?.name || (id === 'me' ? 'Your Profile' : decodeURIComponent(id || 'Scholar'));
  const location = scholar?.location || 'Location not specified';
  const credentials = scholar?.credentials || 'Credentials not specified';
  const bio = scholar?.bio || `${scholarName} is a verified scholar on the Maqam network.`;
  const languages = scholar?.languages || 'English';

  return (
    <div className="min-h-screen bg-forest font-sans text-parchment selection:bg-gold/30 selection:text-gold-light flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest mb-8 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="glass-card border border-parchment/5 rounded-none overflow-hidden text-parchment flex flex-col">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 border-b border-white/10 pb-8">
                <div className="w-32 h-32 rounded-full border border-gold/30 bg-forest-light flex items-center justify-center shadow-[0_0_15px_rgba(167,68,75,0.2)]">
                  {scholar?.avatarUrl ? (
                    <img src={scholar.avatarUrl} alt={scholar.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserCheck size={64} className="text-gold/50" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-black text-4xl mb-2 tracking-tighter">{scholarName}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-parchment/60 font-medium text-sm mb-4">
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gold" /> {location}</span>
                    <span className="flex items-center gap-1.5 text-gold"><Star size={16} fill="currentColor" /> Verified Scholar</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {languages.split(',').map(lang => lang.trim()).filter(Boolean).map((lang, idx) => (
                      <span key={idx} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-parchment/5 border border-white/10 text-parchment/80">{lang}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button onClick={() => setShowInviteModal(true)} className="bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-widest text-[10px] px-8 py-3 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <UserCheck size={16} /> Invite to Slot
                  </button>
                  <button onClick={() => navigate('/masjid/portal', { state: { activeTab: 'current_chat', chatUser: scholarName, chatUserId: scholar?.id } })} className="bg-transparent border border-white/20 hover:border-gold hover:text-gold text-parchment font-bold uppercase tracking-widest text-[10px] px-8 py-3 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <MessageSquare size={16} /> Direct Message
                  </button>
                  <button className="bg-transparent border border-white/20 hover:border-white/40 text-parchment font-bold uppercase tracking-widest text-[10px] px-8 py-3 transition-colors flex items-center justify-center gap-2">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gold tracking-widest mb-4">Biography</h4>
                    <p className="text-parchment/70 font-light leading-relaxed text-sm whitespace-pre-line">
                      {bio}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs uppercase font-bold text-gold tracking-widest mb-4">Credentials & Expertise</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-parchment/80">
                        <BookOpen size={18} className="text-gold shrink-0 mt-0.5" />
                        <span>{credentials}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-white/10">
                    <h4 className="text-[10px] uppercase font-bold text-gold tracking-widest mb-4">Khateeb Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-parchment/50">Min. Hadiyah</span>
                        <span className="font-bold text-parchment">$250</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                        <span className="text-parchment/50">Travel Distance</span>
                        <span className="font-bold text-parchment">Up to 30 miles</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                        <span className="text-parchment/50">Languages</span>
                        <span className="font-bold text-parchment">English, Arabic</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white/5 border border-white/10">
                    <h4 className="text-[10px] uppercase font-bold text-gold tracking-widest mb-4">Reviews</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-1 text-gold mb-1"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div>
                        <p className="text-xs text-parchment/70 font-light line-clamp-2">"Incredible khutbah. The community was highly engaged and many requested we invite him back."</p>
                        <p className="text-[9px] uppercase tracking-widest text-parchment/40 mt-1 font-bold">- Islamic Center of NY</p>
                      </div>
                      <div className="border-t border-white/5 pt-4">
                        <div className="flex items-center gap-1 text-gold mb-1"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div>
                        <p className="text-xs text-parchment/70 font-light line-clamp-2">"Very punctual and professional. The youth particularly connected with the topic."</p>
                        <p className="text-[9px] uppercase tracking-widest text-parchment/40 mt-1 font-bold">- Muslim Community Center</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {showInviteModal && (
          <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <div className="glass-card max-w-lg w-full border border-gold/20 p-8 shadow-2xl relative">
              <button 
                onClick={() => setShowInviteModal(false)} 
                className="absolute top-6 right-6 text-parchment/60 hover:text-gold transition-colors cursor-pointer"
              >
                 <X size={24} />
              </button>
              <h3 className="font-black text-2xl text-parchment mb-2 tracking-tighter">Invite Khateeb</h3>
              <p className="text-parchment/60 font-light text-sm mb-8">Send an invitation to {scholarName}.</p>
              
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Select Date</label>
                  <select className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 appearance-none cursor-pointer">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() + ((7 - d.getDay() + 5) % 7 || 7) + (i * 7));
                      return <option key={i} value={d.toISOString()}>{format(d, 'MMMM do, yyyy')}</option>;
                    })}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Hadiyya Offered (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $300"
                    value={hadiyyaAmount}
                    onChange={(e) => setHadiyyaAmount(e.target.value)}
                    className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Message</label>
                  <textarea rows={3} placeholder="Add a personal note..." className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 resize-none" />
                </div>
                
                <button 
                  onClick={() => {
                    setShowInviteModal(false);
                    setHadiyyaAmount('');
                  }} 
                  className="w-full bg-gold hover:bg-gold-light text-forest text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 transition-all shadow-[0_0_15px_rgba(231,111,81,0.2)] mt-4 cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

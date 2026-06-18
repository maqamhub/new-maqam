import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPin, Users, History, Bell, Search, Star, MessageSquare, User, Upload, Plus, ArrowLeft, Send, Eye, Settings, UserCheck, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { AddressAutocomplete } from '../components/ui/AddressAutocomplete';
import { useImageUpload } from '../hooks/useImageUpload';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useAllSlots } from '../hooks/useMasjidSlots';
import { useApplications } from '../hooks/useApplications';
import { useUsers } from '../hooks/useUsers';
import { useChat } from '../hooks/useChat';

export default function KhateebPortal() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };
  const [activeTab, setActiveTab] = useState('opportunities');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const { users: allMasjids, loading: usersLoading } = useUsers('masjid');
  const { messages: chatHistory, sendMessage } = useChat(activeChatUserId);

  const filteredMasjids = allMasjids.filter(m => (m.name || '').toLowerCase().includes(chatSearch.toLowerCase()));

  const [notifications, setNotifications] = useState<any[]>([]);

  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    credentials: '',
    location: '',
    expertise: '',
    bio: '',
    minHadiyah: '',
    travelDistance: '',
    languages: '',
    avatarUrl: '',
    documentUrl: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(prev => ({ ...prev, ...data }));
        }
      }
    };
    fetchProfile();
  }, [user]);

  const avatarUpload = useImageUpload({
    initialUrl: profileData.avatarUrl,
    onUpload: (url) => {
      setProfileData((prev: any) => ({ ...prev, avatarUrl: url }));
      if (user) {
        setDoc(doc(db, 'users', user.uid), { avatarUrl: url }, { merge: true });
      }
    }
  });

  const documentsUpload = useImageUpload({
    initialUrl: profileData.documentUrl,
    onUpload: (url) => {
      setProfileData((prev: any) => ({ ...prev, documentUrl: url }));
      if (user) {
        setDoc(doc(db, 'users', user.uid), { documentUrl: url }, { merge: true });
      }
    }
  });

  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const updateProfileData = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveProfileSettings = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { ...profileData, account_type: 'khateeb' }, { merge: true });
    }
    setShowSuccessPopup(true);
  };

  const { applications, loading: appsLoading, sendApplication, updateApplicationStatus } = useApplications('khateeb');
  const { slots: allSlots, loading: slotsLoading } = useAllSlots();
  const upcomingFridays = allSlots;

  const [busyDays, setBusyDays] = useState<Date[]>([]);

  const [toastNotification, setToastNotification] = useState<{message: string} | null>(null);
  const [confirmAction, setConfirmAction] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);

  useEffect(() => {
    const checkMasjidResponses = () => {
      const responses = JSON.parse(localStorage.getItem("masjid_responses") || "[]");
      if (responses.length > 0) {
        responses.forEach((res: any) => {
          if (res.type === "approved" || res.type === "accepted") {
            setNotifications(prev => [{
              type: "confirmed",
              message: `${res.masjid} has confirmed your Khutbah slot.`,
              time: "Just now"
            }, ...prev]);
            setToastNotification({ message: `Application approved by ${res.masjid}!` });
            
            setTimeout(() => setToastNotification(null), 5000);
          } else if (res.type === "denied" || res.type === "declined") {
            setNotifications(prev => [{
              type: "rejected",
              message: `${res.masjid} has declined your request.`,
              time: "Just now"
            }, ...prev]);
          }
        });
        localStorage.removeItem("masjid_responses");
      }
    };
    checkMasjidResponses();
    window.addEventListener("masjid_responded", checkMasjidResponses);
    return () => window.removeEventListener("masjid_responded", checkMasjidResponses);
  }, []);


  return (
    <div className="min-h-screen bg-forest text-parchment font-sans selection:bg-gold/30 selection:text-gold-light">
      <nav className="bg-forest/80 text-parchment py-6 px-6 border-b border-parchment/5 sticky top-0 z-10 flex flex-col backdrop-blur-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-black text-2xl tracking-tighter uppercase flex items-center">
              Maqam <span className="font-sans text-[10px] text-gold uppercase tracking-[0.2em] ml-4 bg-gold/10 px-2 py-1 border border-gold/20">Khateeb Console</span>
            </Link>
            <div className="hidden md:flex gap-6 ml-8">
              <button onClick={() => setActiveTab('opportunities')} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'opportunities' ? 'border-gold text-gold' : 'border-transparent text-parchment/50 hover:text-parchment'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('schedule')} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-gold text-gold' : 'border-transparent text-parchment/50 hover:text-parchment'}`}>Schedule</button>
              <button onClick={() => setActiveTab('messages')} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'messages' ? 'border-gold text-gold' : 'border-transparent text-parchment/50 hover:text-parchment'}`}>Messages (2)</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-12 h-12 flex items-center justify-center bg-forest-light border border-gold/20 text-gold hover:bg-forest-pale transition-colors rounded-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-forest-light"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-forest-light border border-gold/20 shadow-2xl z-50 animate-fade-in text-left">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-forest/50">
                    <h4 className="font-bold text-parchment text-sm uppercase tracking-widest">Notifications</h4>
                    <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">2 New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif, i) => (
                      <div key={i} className="p-4 border-b border-white/5 hover:bg-parchment/5 transition-colors cursor-pointer group">
                        <div className="flex gap-3">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-gold shrink-0 group-hover:scale-125 transition-transform"></div>
                          <div>
                            <p className="text-sm text-parchment font-medium leading-snug">{notif.message}</p>
                            <p className="text-[10px] text-parchment/40 uppercase tracking-[0.1em] mt-2 font-bold">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/5 text-center bg-forest/50">
                    <button className="text-[10px] text-gold hover:text-gold-light uppercase tracking-[0.2em] font-bold transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 relative">
               <button onClick={() => setActiveTab('profile')} className="hidden md:flex w-12 h-12 bg-white/5 hover:bg-white/10 text-parchment font-black items-center justify-center border border-white/10 overflow-hidden transition-colors cursor-pointer">
                 {profileData.avatarUrl ? <img src={profileData.avatarUrl} className="w-full h-full object-cover" alt="Profile" /> : <User size={20} className="text-gold" />}
               </button>
               
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-12 h-12 flex items-center justify-center text-parchment hover:text-gold hover:bg-white/5 border border-transparent transition-colors cursor-pointer">
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col items-end gap-4 animate-fade-in w-full">
            <button onClick={() => { setActiveTab('opportunities'); setMobileMenuOpen(false); }} className={`text-right w-full text-xs font-bold uppercase tracking-widest py-2 transition-colors md:hidden ${activeTab === 'opportunities' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}>Dashboard</button>
            <button onClick={() => { setActiveTab('schedule'); setMobileMenuOpen(false); }} className={`text-right w-full text-xs font-bold uppercase tracking-widest py-2 transition-colors md:hidden ${activeTab === 'schedule' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}>Schedule</button>
            <button onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }} className={`text-right w-full text-xs font-bold uppercase tracking-widest py-2 transition-colors md:hidden ${activeTab === 'messages' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}>Messages (2)</button>
            <div className="h-px bg-white/10 my-2 md:hidden w-full"></div>
            <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className={`flex items-center justify-end w-full gap-3 text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors ${activeTab === 'profile' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}>
              Profile View <User size={16} />
            </button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} className={`flex items-center justify-end w-full gap-3 text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors ${activeTab === 'settings' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}>
              Settings <Settings size={16} />
            </button>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center justify-end w-full gap-3 text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors text-red-500/80 hover:text-red-400 mt-2 border-t border-white/5 pt-4">
              Log Out <LogOut size={16} />
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row gap-10 pb-28 md:pb-16">
        
        {/* Left Sidebar Profile Snippet */}
        <div className="w-full md:w-1/4 hidden md:block">
          <div className="glass-card rounded-none border border-gold/10 p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gold/10 text-gold font-black text-4xl flex items-center justify-center border border-gold/30 mb-6 overflow-hidden">
              {profileData.avatarUrl ? <img src={profileData.avatarUrl} className="w-full h-full object-cover" alt="Profile" /> : profileData.name.charAt(0)}
            </div>
            <h3 className="font-bold text-xl text-parchment tracking-tight mb-2">{profileData.name}</h3>
            <p className="text-[10px] uppercase text-gold/80 font-bold tracking-[0.2em] mb-6">{profileData.credentials}</p>
            
            <div className="w-full grid grid-cols-2 gap-4 text-left pt-6 border-t border-white/10">
               <div>
                  <span className="block text-[10px] uppercase text-parchment/40 font-bold tracking-[0.2em] mb-1">Rating</span>
                  <span className="flex items-center gap-1.5 text-sm font-black text-parchment"><Star size={14} className="text-gold fill-gold" /> 4.9</span>
               </div>
               <div>
                  <span className="block text-[10px] uppercase text-parchment/40 font-bold tracking-[0.2em] mb-1">Khutbahs</span>
                  <span className="text-sm font-black text-parchment">42 Delivered</span>
               </div>
            </div>
            
            <button onClick={() => setActiveTab('settings')} className="w-full mt-8 bg-transparent border border-gold text-gold text-xs font-bold uppercase tracking-[0.2em] py-3 transition-colors hover:bg-gold hover:text-forest">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Feed area */}
        <div className="w-full md:w-3/4 block">
          {activeTab === 'profile' && (
            <div className="animate-fade-in glass-card border border-white/5 rounded-none overflow-hidden text-parchment">
              <div className="h-48 bg-forest-light border-b border-white/10 relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-forest to-transparent"></div>
              </div>
              <div className="px-8 pb-12 relative -mt-16">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end mb-10 w-full">
                  <div className="w-32 h-32 rounded-full border border-gold/30 bg-forest flex items-center justify-center shadow-2xl mx-auto md:mx-0 shrink-0 relative z-10 overflow-hidden">
                    {profileData.avatarUrl ? <img src={profileData.avatarUrl} className="w-full h-full object-cover" alt="Profile" /> : <User size={64} className="text-gold/50" />}
                  </div>
                  <div className="flex-1 text-center md:text-left mt-4 md:mt-0 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 w-full pb-2">
                    <div>
                      <h1 className="font-black text-4xl mb-2 tracking-tighter">{profileData.name}</h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-parchment/60 font-medium text-sm mb-4">
                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gold" /> {profileData.location}</span>
                        <span className="flex items-center gap-1.5 text-gold"><Star size={16} fill="currentColor" /> 4.9 (124 reviews)</span>
                        <span className="flex items-center gap-1.5"><UserCheck size={16} className="text-gold" /> {profileData.credentials}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {profileData.expertise.split(',').map((exp: string, i: number) => (
                           <span key={i} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-white/5 border border-white/10 text-parchment/80">{exp.trim()}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 pb-1">
                      <button onClick={() => navigate('/scholar/me')} className="bg-transparent border border-white/20 hover:border-gold hover:text-gold text-parchment font-bold uppercase tracking-widest text-[10px] px-8 py-3 transition-colors flex items-center justify-center gap-2">
                         <Eye size={16} /> Preview Public Site
                      </button>
                      <button onClick={() => setActiveTab('settings')} className="bg-gold hover:bg-gold-light text-forest font-bold uppercase tracking-widest text-[10px] px-8 py-3 transition-colors flex items-center justify-center gap-2">
                        <Settings size={16} /> Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-xs uppercase font-bold text-gold tracking-widest mb-4">Biography</h4>
                      <p className="text-parchment/70 font-light leading-relaxed text-sm whitespace-pre-wrap">{profileData.bio}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs uppercase font-bold text-gold tracking-widest mb-4">Past Khutbah Topics</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-parchment/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0"></div>
                          <span>Navigating Modernity Through the Seerah: Lessons for the 21st Century Muslim</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-parchment/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0"></div>
                          <span>The Economics of Barakah: Earning and Spending in Hard Times</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/10">
                      <h4 className="text-[10px] uppercase font-bold text-gold tracking-widest mb-4">Preferences</h4>
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
                          <p className="text-xs text-parchment/70 font-light line-clamp-2">"Incredible khutbah. The community was highly engaged."</p>
                          <p className="text-[9px] uppercase tracking-widest text-parchment/40 mt-1 font-bold cursor-pointer hover:text-gold transition-colors inline-block" onClick={() => navigate(`/masjid/${encodeURIComponent('Islamic Center of NY')}`)}>- Islamic Center of NY</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="animate-fade-in space-y-12">
              
              {incomingRequests.filter(req => req.status === 'pending').length > 0 && (
                <div>
                  <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                     <div>
                       <h2 className="text-2xl font-black text-parchment tracking-tighter">Incoming Requests</h2>
                       <p className="text-sm text-parchment/60 font-light mt-1">Direct invitations from Masjids.</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                    {incomingRequests.filter(req => req.status === 'pending').map((req) => (
                      <div 
                        key={req.id} 
                        onClick={() => navigate(`/masjid/${encodeURIComponent(req.masjid)}`)}
                        className="glass-card p-6 border border-gold/30 bg-gold/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative rounded-none shadow-[0_0_20px_rgba(167,68,75,0.05)] cursor-pointer hover:border-gold/50"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
                        <div className="flex items-start gap-6 pl-2 relative">
                          <div className="w-16 h-16 bg-forest flex flex-col items-center justify-center shrink-0 border border-gold/40 text-gold shadow-lg shadow-gold/10">
                            <span className="text-[10px] uppercase font-bold tracking-widest">{format(req.date, 'MMM')}</span>
                            <span className="text-2xl font-black -mt-1 leading-none">{format(req.date, 'dd')}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-parchment text-xl tracking-tight mb-2 group-hover:text-gold transition-colors">
                              {req.masjid}
                            </h4>
                            <div className="flex flex-wrap gap-4 text-xs text-parchment/60 font-medium mb-3">
                              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold/50"/> {req.distance}</span>
                              <span className="flex items-center gap-1.5"><Users size={14} className="text-gold/50"/> 300+ Attend.</span>
                              <span className="flex items-center gap-1.5 text-gold"><CalendarIcon size={14} /> 1:15 PM</span>
                            </div>
                            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-3 py-1.5">
                              <span className="text-[10px] uppercase font-bold text-gold tracking-widest">Hadiyya Offered:</span>
                              <span className="text-sm font-black text-parchment">{req.hadiyah}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 md:pl-6 min-w-[120px] md:border-l md:border-white/10 relative z-10">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmAction({
                                title: 'Deny Request',
                                message: `Are you sure you want to deny the request from ${req.masjid}?`,
                                onConfirm: () => {
                                  setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
                                  setToastNotification({ message: 'Request denied. The masjid has been notified.' });
                                  setNotifications(prev => [{type: "rejected", message: `You denied the request from ${req.masjid}.`, time: "Just now"}, ...prev]);
                                  const responses = JSON.parse(localStorage.getItem("imam_responses") || "[]");
                                  responses.push({ type: "denied", imam: profileData.name, masjid: req.masjid, date: req.date });
                                  localStorage.setItem("imam_responses", JSON.stringify(responses));
                                  window.dispatchEvent(new Event("imam_responded"));
                                  setTimeout(() => setToastNotification(null), 5000);
                                }
                              });
                            }} 
                            className="flex-1 md:flex-none border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-3 transition-colors cursor-pointer"
                          >
                            Deny
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmAction({
                                title: 'Accept Request',
                                message: `Are you sure you want to accept the Khutbah at ${req.masjid} on ${format(req.date, 'MMM do')}?`,
                                onConfirm: () => {
                                  setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
                                  setToastNotification({ message: `Accepted Khutbah at ${req.masjid} on ${format(req.date, 'MMM do')}. The masjid has been notified.` });
                                  setNotifications(prev => [{type: "confirmed", message: `You accepted Khutbah at ${req.masjid} on ${format(req.date, 'MMM do')}.`, time: "Just now"}, ...prev]);
                                  const responses = JSON.parse(localStorage.getItem("imam_responses") || "[]");
                                  responses.push({ type: "accepted", imam: profileData.name, masjid: req.masjid, date: req.date });
                                  localStorage.setItem("imam_responses", JSON.stringify(responses));
                                  window.dispatchEvent(new Event("imam_responded"));
                                  setTimeout(() => setToastNotification(null), 5000);
                                }
                              });
                            }} 
                            className="flex-1 md:flex-none bg-gold text-forest hover:bg-gold-light text-[10px] uppercase font-bold tracking-[0.2em] px-6 py-3 transition-colors shadow-[0_0_15px_rgba(231,111,81,0.2)] cursor-pointer"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                   <div>
                     <h2 className="text-3xl font-black text-parchment mb-2 tracking-tighter">Open Opportunities</h2>
                     <p className="text-sm text-parchment/60 font-light">Masjids requesting Khateebs within a 20 mile radius.</p>
                   </div>
                   <div className="flex gap-2">
                     <button className="px-5 py-2.5 glass-card-light border border-gold/20 text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 text-parchment hover:border-gold/50 transition-colors">
                       <Search size={14} className="text-gold" /> Filter 
                     </button>
                   </div>
                </div>
  
                <div className="space-y-4">
                  {upcomingFridays.map((slot: any, i) => {
                    const hasApplied = applications.some((a) => a.slotId === slot.id && a.type === 'application');
                    return (
                  <div 
                    key={i} 
                    onClick={() => navigate(`/masjid/${encodeURIComponent(slot.masjidId)}`)}
                    className="glass-card p-6 border border-white/5 hover:border-gold/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group rounded-none"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-forest-light flex flex-col items-center justify-center shrink-0 border border-gold/20 text-gold">
                        <span className="text-[10px] uppercase font-bold tracking-widest">{format(slot.date, 'MMM')}</span>
                        <span className="text-2xl font-black -mt-1 leading-none">{format(slot.date, 'dd')}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-parchment text-xl flex items-center gap-3 tracking-tight group-hover:text-gold transition-colors mb-2">
                          Masjid {slot.masjidId.slice(0, 4)}
                          {hasApplied && (
                             <span className="bg-gold/10 border border-gold/20 text-gold text-[9px] px-2.5 py-1 uppercase tracking-[0.2em] font-bold">Applied</span>
                          )}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-xs text-parchment/60 font-medium mb-3">
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold/50"/> 5 miles (Estimated)</span>
                          <span className="flex items-center gap-1.5"><Users size={14} className="text-gold/50"/> 400-500 Attend.</span>
                          <span className="flex items-center gap-1.5 text-gold"><CalendarIcon size={14} /> {slot.time}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-3 py-1.5">
                          <span className="text-[10px] uppercase font-bold text-gold tracking-widest">Hadiyya Offered:</span>
                          <span className="text-sm font-black text-parchment">{slot.hadiyyaAmount || 'Negotiable'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 min-w-[120px] relative z-10">
                      {!hasApplied && slot.status === 'open' ? (
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            await sendApplication({
                              slotId: slot.id,
                              masjidId: slot.masjidId
                            });
                            setToastNotification({ message: `Application sent successfully!` });
                            setTimeout(() => setToastNotification(null), 5000);
                          }}
                          className="bg-gold hover:bg-gold-light text-forest text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 transition-all shadow-[0_0_15px_rgba(231,111,81,0.2)] cursor-pointer"
                        >
                          Apply Now
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent text-parchment/40 text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 border border-white/10 cursor-default"
                        >
                          {slot.status === 'filled' ? 'Filled' : 'Pending'}
                        </button>
                      )}
                    </div>
                   </div>
                  )})}
               </div>
             </div>
           </div>
         )}

         {activeTab === 'schedule' && (
             <div className="animate-fade-in text-left">
               <div className="mb-8 border-b border-white/10 pb-6">
                 <h2 className="text-3xl font-black tracking-tighter text-parchment mb-2">My Schedule</h2>
                 <p className="text-sm text-parchment/60 font-light">View your upcoming Khutbahs and pending requests. <br/><span className="text-gold/80 italic mt-1 inline-block">Click any open date below to quickly mark yourself as busy.</span></p>
               </div>
               
               <AvailabilityCalendar 
                  onDateClick={(date) => {
                    const isBooked = [
                      { date: addDays(new Date(), -4) },
                      { date: addDays(new Date(), 10) },
                      ...incomingRequests,
                      ...upcomingFridays.filter(f => f.status === "booked")
                    ].some(s => isSameDay(s.date, date));
                    
                    if (isBooked) {
                      setToastNotification({ message: "Cannot mark a booked date as busy." });
                      setTimeout(() => setToastNotification(null), 5000);
                      return;
                    }
                    
                    const isBusy = busyDays.some(d => isSameDay(d, date));
                    setConfirmAction({
                      title: isBusy ? "Mark as Available" : "Mark as Busy",
                      message: isBusy 
                        ? `Are you sure you want to mark ${format(date, "MMM do, yyyy")} as available?` 
                        : `Are you sure you want to mark ${format(date, "MMM do, yyyy")} as busy?`,
                      onConfirm: () => {
                        setBusyDays(prev => {
                          if (isBusy) {
                            return prev.filter(d => !isSameDay(d, date));
                          } else {
                            return [...prev, date];
                          }
                        });
                        setToastNotification({ message: isBusy ? `${format(date, "MMM do")} is now available.` : `${format(date, "MMM do")} marked as busy.` });
                        setTimeout(() => setToastNotification(null), 5000);
                      }
                    });
                  }}
                  slots={[
                    { date: addDays(new Date(), -4), status: "booked", label: "ICNY" },
                    { date: addDays(new Date(), 10), status: "booked", label: "Darul Arqam" },
                    ...incomingRequests.map(req => ({
                      date: req.date,
                      status: "pending" as const,
                      label: req.masjid
                    })),
                    ...upcomingFridays.filter(f => f.status === "applied").map(req => ({
                      date: req.date,
                      status: "open" as const,
                      label: "Applied"
                    })),
                    ...upcomingFridays.filter(f => f.status === "booked").map(req => ({
                      date: req.date,
                      status: "booked" as const,
                      label: req.masjid
                    })),
                    ...busyDays.map(d => ({
                      date: d,
                      status: "busy" as const,
                      label: "Busy"
                    }))
                  ]}
                />
             </div>
          )}

          {activeTab === 'messages' && (
             <div className="animate-fade-in flex flex-col h-[600px] glass-card border border-white/5 rounded-none relative overflow-hidden">
               <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between z-10">
                 <div>
                   <h3 className="font-black text-2xl text-parchment tracking-tighter">Inbox</h3>
                   <p className="text-parchment/50 font-light text-sm mt-1">Coordinate with masjids and organizers.</p>
                 </div>
                 <button onClick={() => setActiveTab('new_chat')} className="bg-gold hover:bg-gold-light text-forest px-4 py-2 rounded-none font-bold text-xs tracking-widest uppercase inline-flex items-center gap-2 transition-colors cursor-pointer border border-gold/50 shadow-[0_0_15px_rgba(231,111,81,0.2)]">
                   <Plus size={16} /> New Chat
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto z-10">
                 <div 
                   className="p-6 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                   onClick={() => { setActiveChatUser('Westside Muslim Community'); setActiveTab('current_chat'); }}
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-forest-light text-gold border border-gold/20 flex items-center justify-center font-bold text-xl relative">
                       W
                       <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-forest"></span>
                     </div>
                     <div>
                       <h4 className="font-bold text-parchment group-hover:text-gold transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/masjid/${encodeURIComponent('Westside Muslim Community')}`); }}>Westside Muslim Community</h4>
                       <p className="text-sm text-parchment/60 mt-1 line-clamp-1">Can you confirm the topic for next Friday?</p>
                     </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className="text-[10px] text-parchment/40 uppercase font-bold tracking-widest">2 hours ago</span>
                   </div>
                 </div>
                 <div 
                   className="p-6 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group opacity-70 hover:opacity-100"
                   onClick={() => { setActiveChatUser('ICNY Islamic Center'); setActiveTab('current_chat'); }}
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-forest-light text-parchment/50 border border-parchment/10 flex items-center justify-center font-bold text-xl">
                       I
                     </div>
                     <div>
                       <h4 className="font-bold text-parchment group-hover:text-gold transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/masjid/${encodeURIComponent('ICNY Islamic Center')}`); }}>ICNY Islamic Center</h4>
                       <p className="text-sm text-parchment/60 mt-1 line-clamp-1">Excellent, looking forward to your khutbah.</p>
                     </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className="text-[10px] text-parchment/40 uppercase font-bold tracking-widest">Jul 4</span>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'new_chat' && (
             <div className="animate-fade-in p-16 glass-card border border-white/5 text-center rounded-none relative overflow-hidden flex flex-col items-center justify-center">
               <MessageSquare size={40} className="mx-auto text-gold/20 mb-4" />
               <h3 className="font-black text-2xl text-parchment mb-2 tracking-tighter">New Conversation</h3>
               <p className="text-parchment/50 font-light text-sm max-w-sm mx-auto leading-relaxed mb-8">Enter the name of a Masjid or Organization to start a secure thread.</p>
               <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                 <div className="relative w-full">
                   <input 
                     type="text" 
                     placeholder="Search Masjid Name..." 
                     value={chatSearch}
                     onChange={(e) => {
                       setChatSearch(e.target.value);
                       setShowSuggestions(true);
                     }}
                     onFocus={() => setShowSuggestions(true)}
                     onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                     className="w-full bg-forest/50 text-parchment border border-white/10 p-4 font-sans focus:outline-none focus:border-gold/50 transition-colors" 
                   />
                   {showSuggestions && chatSearch && (
                     <div className="absolute top-full left-0 right-0 mt-1 bg-forest-light border border-white/10 shadow-xl z-10 max-h-48 overflow-y-auto text-left">
                       {filteredMasjids.length > 0 ? (
                         filteredMasjids.map((masjid, idx) => (
                           <div 
                             key={idx} 
                             className="p-3 hover:bg-white/5 cursor-pointer text-sm text-parchment border-b border-white/5 last:border-0"
                             onMouseDown={(e) => {
                               // use onMouseDown to prevent blur from hiding it before click
                               e.preventDefault();
                               setChatSearch(masjid.name || masjid.id);
                               setActiveChatUserId(masjid.id);
                               setShowSuggestions(false);
                             }}
                           >
                             {masjid.name || `Masjid ${masjid.id.slice(0,4)}`}
                           </div>
                         ))
                       ) : (
                         <div className="p-3 text-sm text-parchment/50">No masjids found matching "{chatSearch}"</div>
                       )}
                     </div>
                   )}
                 </div>
                 <div className="flex gap-4 mt-2">
                   <button onClick={() => { setActiveTab('messages'); setChatSearch(''); }} className="flex-1 bg-transparent border border-white/20 text-parchment hover:bg-white/5 px-6 py-3 font-bold text-sm tracking-widest uppercase transition-colors cursor-pointer">
                     Cancel
                   </button>
                   <button onClick={() => { 
                     setActiveTab('current_chat'); 
                     setActiveChatUser(chatSearch); 
                     setChatSearch(''); 
                   }} disabled={!chatSearch || !activeChatUserId} className="flex-1 bg-gold hover:bg-gold-light text-forest border border-gold/50 shadow-[0_0_15px_rgba(231,111,81,0.2)] px-6 py-3 font-bold text-sm tracking-widest uppercase transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                     Start Chat
                   </button>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'current_chat' && (
             <div className="animate-fade-in flex flex-col h-[600px] glass-card border border-white/5 rounded-none relative overflow-hidden">
               {/* Chat Header */}
               <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between z-10">
                 <div className="flex items-center gap-4">
                   <button onClick={() => setActiveTab('messages')} className="text-parchment/60 hover:text-parchment transition-colors cursor-pointer">
                     <ArrowLeft size={20} />
                   </button>
                   <div className="flex items-center gap-3 cursor-pointer group" onClick={() => activeChatUser && navigate(`/masjid/${encodeURIComponent(activeChatUser)}`)}>
                     <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center font-bold text-lg border border-gold/20">
                       {activeChatUser?.charAt(0) || '?'}
                     </div>
                     <div>
                       <h4 className="font-bold text-parchment text-sm group-hover:text-gold transition-colors">{activeChatUser}</h4>
                       <span className="text-[10px] text-green-400 uppercase tracking-wider font-bold">Online</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Chat Messages */}
               <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 flex flex-col pt-10">
                 {chatHistory.length === 0 ? (
                   <div className="m-auto text-center">
                     <MessageSquare size={32} className="mx-auto text-parchment/20 mb-3" />
                     <p className="text-parchment/50 text-sm font-light">Start a conversation with {activeChatUser}</p>
                   </div>
                 ) : (
                   chatHistory.map((msg, i) => {
                     const isMe = msg.senderId === auth.currentUser?.uid;
                     return (
                     <div key={i} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                       <div className={`p-3 text-sm shadow-md ${isMe ? 'bg-gold text-forest rounded-l-xl rounded-tr-xl' : 'bg-forest border border-white/10 text-parchment rounded-r-xl rounded-tl-xl'}`}>
                         {msg.text}
                       </div>
                       <span className={`text-[10px] text-parchment/30 mt-1 uppercase tracking-widest ${isMe ? 'mr-1' : 'ml-1'}`}>
                          {msg.created_at ? format(msg.created_at, 'h:mm a') : 'Just now'}
                       </span>
                     </div>
                   )})
                 )}
               </div>

               {/* Chat Input */}
               <div className="p-4 border-t border-white/10 bg-forest/80 relative z-10">
                 <form 
                   onSubmit={async (e) => {
                     e.preventDefault();
                     if (!messageInput.trim()) return;
                     await sendMessage(messageInput);
                     setMessageInput('');
                   }}
                   className="flex gap-2"
                 >
                   <input
                     type="text"
                     placeholder="Type your message..."
                     value={messageInput}
                     onChange={(e) => setMessageInput(e.target.value)}
                     className="flex-1 bg-white/5 border border-white/10 text-parchment px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors placeholder:text-parchment/30"
                   />
                   <button
                     type="submit"
                     disabled={!messageInput.trim()}
                     className="bg-gold text-forest w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Send size={18} />
                   </button>
                 </form>
               </div>
             </div>
          )}

          {activeTab === 'settings' && (
             <div className="animate-fade-in p-8 md:p-12 glass-card border border-white/5 rounded-none relative overflow-hidden">
               <h3 className="font-black text-3xl text-parchment mb-8 tracking-tighter">Profile Settings</h3>
               
               <div className="space-y-8 text-left">
                 <div>
                   <h4 className="text-sm font-bold text-gold uppercase tracking-[0.2em] mb-4">Personal Details</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Full Name</label>
                       <input type="text" value={profileData.name} onChange={(e) => updateProfileData('name', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Credentials</label>
                       <input type="text" value={profileData.credentials} onChange={(e) => updateProfileData('credentials', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Location (City, State)</label>
                       <AddressAutocomplete 
                         value={profileData.location || ''} 
                         onChange={(value) => updateProfileData('location', value)} 
                         className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" 
                         placeholder="Enter your city and state..."
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Expertise (Comma Separated)</label>
                       <input type="text" value={profileData.expertise} onChange={(e) => updateProfileData('expertise', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                   </div>
                   <div className="space-y-2 mb-6">
                     <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Biography</label>
                     <textarea rows={4} value={profileData.bio} onChange={(e) => updateProfileData('bio', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors resize-none"></textarea>
                   </div>
                   <h4 className="text-sm font-bold text-gold uppercase tracking-[0.2em] mb-4 mt-8">Preferences</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Min. Hadiyah</label>
                       <input type="text" value={profileData.minHadiyah} onChange={(e) => updateProfileData('minHadiyah', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Travel Distance</label>
                       <input type="text" value={profileData.travelDistance} onChange={(e) => updateProfileData('travelDistance', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Languages</label>
                       <input type="text" value={profileData.languages} onChange={(e) => updateProfileData('languages', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                   </div>
                 </div>

                 <div>
                   <h4 className="text-sm font-bold text-gold uppercase tracking-[0.2em] mb-4">Documents & Verification</h4>
                   
                   <div 
                     className="border border-dashed border-white/20 p-8 text-center hover:bg-white/5 transition-colors cursor-pointer"
                     onClick={avatarUpload.handleThumbnailClick}
                   >
                     {avatarUpload.uploading ? (
                       <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-gold/30 border-t-gold animate-spin"></div>
                     ) : avatarUpload.previewUrl ? (
                        <div className="relative w-24 h-24 mx-auto mb-4">
                           <img src={avatarUpload.previewUrl} alt="Avatar preview" className="w-full h-full object-cover rounded-full" />
                           <button 
                             onClick={(e) => { e.stopPropagation(); avatarUpload.handleRemove(); }} 
                             className="absolute -top-2 -right-2 bg-red-500 text-parchment rounded-full p-1 z-10"
                           >
                             <X size={12} />
                           </button>
                        </div>
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-forest-light border border-white/10 flex items-center justify-center mx-auto mb-4 text-gold">
                          <User size={20} />
                        </div>
                     )}
                     <p className="text-sm text-parchment font-bold mb-1">Upload Profile Photo</p>
                     <p className="text-xs text-parchment/50 text-ellipsis overflow-hidden whitespace-nowrap">
                       {avatarUpload.uploading ? `Uploading ${Math.round(avatarUpload.uploadProgress)}%` : avatarUpload.fileName || "JPG, PNG up to 5MB"}
                     </p>
                     <input 
                       type="file" 
                       ref={avatarUpload.fileInputRef} 
                       onChange={avatarUpload.handleFileChange} 
                       className="hidden" 
                       accept="image/jpeg,image/png" 
                     />
                   </div>

                   <div 
                     className="border border-dashed border-white/20 p-8 text-center hover:bg-white/5 transition-colors cursor-pointer mt-4"
                     onClick={documentsUpload.handleThumbnailClick}
                   >
                     {documentsUpload.uploading ? (
                       <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-gold/30 border-t-gold animate-spin"></div>
                     ) : documentsUpload.previewUrl ? (
                        <div className="relative w-24 h-24 mx-auto mb-4 flex py-2 bg-forest-light items-center justify-center text-parchment rounded-sm">
                           <div className="text-xs text-center truncate px-2">{documentsUpload.fileName || "Document Verified"}</div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); documentsUpload.handleRemove(); }} 
                             className="absolute -top-2 -right-2 bg-red-500 text-forest-light rounded-full p-1 z-10"
                           >
                             <X size={12} />
                           </button>
                        </div>
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-forest-light border border-white/10 flex items-center justify-center mx-auto mb-4 text-gold">
                          <Upload size={20} />
                        </div>
                     )}
                     <p className="text-sm text-parchment font-bold mb-1">Upload Ijazah / Certificates</p>
                     <p className="text-xs text-parchment/50 text-ellipsis overflow-hidden whitespace-nowrap">
                       {documentsUpload.uploading ? `Uploading ${Math.round(documentsUpload.uploadProgress)}%` : documentsUpload.fileName || "PDF or Image up to 10MB"}
                     </p>
                     <input 
                       type="file" 
                       ref={documentsUpload.fileInputRef} 
                       onChange={documentsUpload.handleFileChange} 
                       className="hidden" 
                       accept="application/pdf,image/jpeg,image/png" 
                     />
                   </div>
                 </div>

                 <button onClick={saveProfileSettings} className="bg-gold hover:bg-gold-light text-forest text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 transition-all shadow-[0_0_15px_rgba(231,111,81,0.2)] cursor-pointer">
                   Save Changes
                 </button>
               </div>
             </div>
          )}
        </div>

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <div className="glass-card max-w-sm w-full border border-gold/20 p-8 shadow-2xl relative animate-fade-in text-center">
              <h3 className="text-xl font-black text-parchment tracking-tighter mb-2">Success</h3>
              <p className="text-sm text-parchment/60 font-light mb-8">Settings have been saved successfully.</p>
              <button 
                onClick={() => setShowSuccessPopup(false)} 
                className="w-full bg-gold text-forest hover:bg-gold-light px-4 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors shadow-[0_0_15px_rgba(231,111,81,0.2)] cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-forest border-t border-white/10 z-50 flex justify-around items-center pb-safe">
         <button onClick={() => setActiveTab('opportunities')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'opportunities' ? 'text-gold' : 'text-parchment/40'}`}>
            <LayoutDashboard size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Dashboard</span>
         </button>
         <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'schedule' ? 'text-gold' : 'text-parchment/40'}`}>
            <History size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Schedule</span>
         </button>
         <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'messages' ? 'text-gold' : 'text-parchment/40'}`}>
            <MessageSquare size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Inbox</span>
         </button>
         <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'profile' ? 'text-gold' : 'text-parchment/40'}`}>
            <User size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Profile</span>
         </button>
      </div>
      
      {confirmAction && (
        <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
          <div className="glass-card max-w-sm w-full border border-gold/20 p-8 shadow-2xl relative animate-fade-in text-center">
            <h3 className="text-xl font-black text-parchment tracking-tighter mb-2">{confirmAction.title}</h3>
            <p className="text-sm text-parchment/60 font-light mb-8">{confirmAction.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmAction(null)} className="flex-1 border border-white/20 text-parchment/60 hover:text-white px-4 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors cursor-pointer">
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }} 
                className="flex-1 bg-gold text-forest hover:bg-gold-light px-4 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors shadow-[0_0_15px_rgba(231,111,81,0.2)] cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

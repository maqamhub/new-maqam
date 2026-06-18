import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building, MapPin, Users, History, Bell, CalendarClock, UserCheck, Search, Star, MessageSquare, Upload, Plus, ArrowLeft, Send, Menu, User, Settings, X, Eye, LogOut, Globe } from 'lucide-react';
import { format, addDays } from 'date-fns';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import TimePicker from '../components/TimePicker';
import { DatePicker } from '../components/ui/date-picker';
import { AddressAutocomplete } from '../components/ui/AddressAutocomplete';
import { useImageUpload } from '../hooks/useImageUpload';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useMasjidSlots } from '../hooks/useMasjidSlots';
import { useUsers } from '../hooks/useUsers';
import { useChat } from '../hooks/useChat';

export default function MasjidPortal() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'slots');
  const [slotsViewMode, setSlotsViewMode] = useState<'list' | 'month'>('list');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState<number | null>(null);
  const [showSlotDetailsModal, setShowSlotDetailsModal] = useState<number | null>(null);
  const [activeImamProfile, setActiveImamProfile] = useState<string | null>(null);
  const [scholarSearch, setScholarSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(location.state?.chatUserId || null);
  const [activeChatUser, setActiveChatUser] = useState<string | null>(location.state?.chatUser || null);
  const [messageInput, setMessageInput] = useState('');

  const { users: allKhateebs, loading: usersLoading } = useUsers('khateeb');
  const { messages: chatHistory, sendMessage } = useChat(activeChatUserId);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.chatUser) {
      setActiveChatUser(location.state.chatUser);
    }
    if (location.state?.chatUserId) {
      setActiveChatUserId(location.state.chatUserId);
    }
  }, [location.state]);

  const filteredScholars = allKhateebs.filter(s => (s.name || '').toLowerCase().includes(chatSearch.toLowerCase()));

  const [invitedScholars, setInvitedScholars] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState<string | null>(null);
  const [showPostSlotModal, setShowPostSlotModal] = useState(false);
  const [postSlotDate, setPostSlotDate] = useState<Date | undefined>();
  const [hadiyyaAmount, setHadiyyaAmount] = useState('');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [toastNotification, setToastNotification] = useState<{message: string} | null>(null);
  const [confirmAction, setConfirmAction] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);

  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    address: '',
    description: '',
    focusAreas: '',
    jumuahTime: '',
    languages: '',
    avgAttendees: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
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

  const logoUpload = useImageUpload({
    initialUrl: profileData.logoUrl,
    onUpload: (url) => {
      setProfileData((prev: any) => ({ ...prev, logoUrl: url }));
      if (user) {
        setDoc(doc(db, 'users', user.uid), { logoUrl: url }, { merge: true });
      }
    }
  });
  
  const taxUpload = useImageUpload({
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
      await setDoc(docRef, { ...profileData, account_type: 'masjid' }, { merge: true });
    }
    setShowSuccessPopup(true);
  };




  const { slots: postedSlots, loading: slotsLoading, createSlot } = useMasjidSlots();

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-forest text-parchment font-sans selection:bg-gold/30 selection:text-gold-light">
      <nav className="bg-forest/80 text-parchment py-6 px-6 border-b border-parchment/5 sticky top-0 z-10 flex flex-col backdrop-blur-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-black text-2xl tracking-tighter flex items-center uppercase">
              Maqam <span className="font-sans text-[10px] bg-gold/10 text-gold uppercase tracking-[0.2em] px-2 py-1 border border-gold/20 ml-4">Masjid Console</span>
            </Link>
            <div className="hidden md:flex gap-6 ml-8">
              <button onClick={() => setActiveTab('slots')} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'slots' ? 'border-gold text-gold' : 'border-transparent text-parchment/50 hover:text-parchment'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('directory')} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'directory' ? 'border-gold text-gold' : 'border-transparent text-parchment/50 hover:text-parchment'}`}>Scholars</button>
              <button onClick={() => setActiveTab('messages')} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${activeTab === 'messages' ? 'border-gold text-gold' : 'border-transparent text-parchment/50 hover:text-parchment'}`}>Messages (1)</button>
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
                    <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">3 New</span>
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
                 {profileData.logoUrl ? <img src={profileData.logoUrl} className="w-full h-full object-cover" alt="Logo" /> : <Building size={20} className="text-gold" />}
               </button>
               
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-12 h-12 flex items-center justify-center text-parchment hover:text-gold hover:bg-white/5 border border-transparent transition-colors cursor-pointer">
                  <Menu size={24} />
               </button>
            </div>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col items-end gap-4 animate-fade-in w-full">
            <button onClick={() => { setActiveTab('slots'); setMobileMenuOpen(false); }} className={`text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors ${activeTab === 'slots' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'} w-full`}>Dashboard</button>
            <button onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }} className={`text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors ${activeTab === 'directory' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'} w-full`}>Scholars</button>
            <button onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }} className={`text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors ${activeTab === 'messages' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'} w-full`}>Messages (1)</button>
            <div className="h-px bg-white/10 my-2 w-full"></div>
            <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className={`flex items-center justify-end gap-3 text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors ${activeTab === 'profile' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'} w-full`}>
              Profile View <User size={16} />
            </button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} className={`flex items-center justify-end gap-3 text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors ${activeTab === 'settings' ? 'text-gold' : 'text-parchment/50 hover:text-parchment'} w-full`}>
              Settings <Settings size={16} />
            </button>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center justify-end gap-3 text-right text-xs font-bold uppercase tracking-widest py-2 transition-colors text-red-500/80 hover:text-red-400 mt-2 border-t border-white/5 pt-4 w-full">
              Log Out <LogOut size={16} />
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row gap-10 pb-28 md:pb-16">
        
        {/* Left Sidebar Profile Snippet */}
        <div className="w-full md:w-1/4 hidden md:block">
          <div className="glass-card rounded-none border border-gold/10 p-8">
            <div className="mb-8 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gold tracking-[0.2em] mb-2">Organization</span>
              <h3 className="font-black tracking-tight text-2xl text-parchment">{profileData.name}</h3>
              <p className="text-sm font-medium text-parchment/60 flex items-center gap-1.5 mt-2"><MapPin size={14}/> {profileData.address.split(',')[1]?.trim() || profileData.address}</p>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-white/10">
               <div>
                  <span className="block text-[10px] uppercase text-parchment/40 font-bold tracking-[0.2em] mb-2">Weekly Congregation</span>
                  <span className="flex items-center gap-3 text-sm font-bold text-parchment">
                     <Users size={16} className="text-gold" /> {profileData.avgAttendees} Attendees
                  </span>
               </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-10">
              <button onClick={() => setShowPostSlotModal(true)} className="w-full bg-gold hover:bg-gold-light text-forest flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-4 transition-all border border-gold shadow-[0_0_15px_rgba(167,68,75,0.2)] cursor-pointer">
                <CalendarClock size={16} /> Post New Slot
              </button>
              <button onClick={() => setActiveTab('settings')} className="w-full bg-transparent border border-white/20 text-parchment/70 hover:text-parchment hover:border-gold hover:bg-gold/5 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-4 transition-all">
                Edit Organization Profile
              </button>
            </div>
          </div>
        </div>

        {/* Feed area */}
        <div className="w-full md:w-3/4 block">
          {activeTab === 'profile' && (
             <div className="animate-fade-in glass-card border border-white/5 rounded-none overflow-hidden text-parchment">
                {/* Header Banner & Profile */}
                <div className="h-48 bg-forest-light border-b border-white/10 relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-forest to-transparent"></div>
                   <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                      <div className="w-32 h-32 bg-forest border border-gold/30 rounded-none shadow-2xl flex items-center justify-center overflow-hidden">
                         {profileData.logoUrl ? <img src={profileData.logoUrl} className="w-full h-full object-cover" alt="Logo" /> : <Building size={48} className="text-gold/50" />}
                      </div>
                   </div>
                </div>

                <div className="pt-24 px-8 pb-12">
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                           <h1 className="font-black text-4xl tracking-tighter">{profileData.name}</h1>
                           <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold border border-gold/50 text-forest text-[10px] font-bold uppercase tracking-widest w-fit">
                             <UserCheck size={14} /> Up Next: {postedSlots.find(s => s.status === "filled")?.khateeb || "To be determined"}
                           </span>
                        </div>
                        <p className="text-parchment/60 font-medium flex items-center gap-2 text-sm max-w-xl">
                           <MapPin size={16} className="text-gold shrink-0" /> 
                           <a href={`https://maps.google.com/?q=${encodeURIComponent(profileData.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors hover:underline line-clamp-1">{profileData.address}</a>
                        </p>
                        {profileData.website && profileData.website.trim() !== '' && (
                          <p className="text-parchment/60 font-medium flex items-center gap-2 text-sm max-w-xl mt-2">
                            <Globe size={16} className="text-gold shrink-0" />
                            <a href={(profileData.website.startsWith('http://') || profileData.website.startsWith('https://')) ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors hover:underline line-clamp-1">{profileData.website}</a>
                          </p>
                        )}
                     </div>
                     <button className="bg-transparent border border-gold hover:bg-gold hover:text-forest text-gold px-6 py-3 font-bold uppercase tracking-[0.2em] text-[10px] transition-colors shrink-0">
                        Follow Updates
                     </button>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="md:col-span-2 space-y-10">
                         <section>
                            <h3 className="text-xs uppercase font-bold text-gold tracking-[0.2em] mb-4">About the Organization</h3>
                            <p className="text-sm text-parchment/70 leading-relaxed font-light whitespace-pre-wrap">{profileData.description}</p>
                         </section>
                         
                         <section>
                            <h3 className="text-xs uppercase font-bold text-gold tracking-[0.2em] mb-4">Key Priorities</h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                               {profileData.focusAreas.split(',').map((area: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 uppercase tracking-widest font-bold text-parchment/60">{area.trim()}</span>
                               ))}
                            </div>
                         </section>
                      </div>
                      
                      <div className="space-y-6">
                         <div className="p-6 bg-forest-light/50 border border-white/5">
                            <h3 className="text-[10px] uppercase font-bold text-gold tracking-[0.2em] mb-5">Jumuah Details</h3>
                            <div className="space-y-4 text-sm">
                               <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                 <span className="text-parchment/50">Start Time</span>
                                 <span className="font-bold text-parchment flex items-center gap-2"><CalendarClock size={14} className="text-gold" /> {profileData.jumuahTime}</span>
                               </div>
                               <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                 <span className="text-parchment/50">Language</span>
                                 <span className="font-bold text-parchment">{profileData.languages}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                 <span className="text-parchment/50">Congregation</span>
                                 <span className="font-bold text-parchment flex items-center gap-2"><Users size={14} className="text-gold" /> {profileData.avgAttendees}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'slots' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                 <div>
                   <h2 className="text-3xl font-black tracking-tighter text-parchment mb-2">Upcoming Slots</h2>
                   <p className="text-sm text-parchment/60 font-light">Manage applications and secure your pulpit.</p>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => setSlotsViewMode(slotsViewMode === 'month' ? 'list' : 'month')} className="px-5 py-2.5 glass-card-light border border-gold/20 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-parchment hover:border-gold/50 transition-colors cursor-pointer">
                     {slotsViewMode === 'month' ? 'List View' : 'Month View'}
                   </button>
                 </div>
              </div>

              {slotsViewMode === 'month' ? (
                <AvailabilityCalendar 
                  slots={postedSlots.map((slot, i) => ({
                    date: slot.date,
                    status: slot.status === 'filled' ? 'booked' : 'open',
                    label: slot.status === "filled" ? slot.khateeb || "Filled" : "Open",
                    onClick: () => {
                      if (slot.status === 'filled') {
                        setShowSlotDetailsModal(i);
                      } else {
                        setActiveTab('directory');
                      }
                    }
                  }))}
                />
              ) : (
              <div className="space-y-4">
                {postedSlots.map((slot, i) => (
                  <div key={i} className={cn("glass-card p-6 border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all rounded-none", slot.status === 'filled' ? 'border-gold/40 shadow-[0_0_20px_rgba(231,111,81,0.05)]' : 'border-white/5 hover:border-gold/30')}>
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-forest-light flex flex-col items-center justify-center shrink-0 border border-gold/20 text-gold">
                        <span className="text-[10px] uppercase font-bold tracking-widest">{format(slot.date, 'MMM')}</span>
                        <span className="text-2xl font-black -mt-1 leading-none">{format(slot.date, 'dd')}</span>
                      </div>
                      <div>
                        <h4 className="font-bold tracking-tight text-parchment text-xl flex items-center gap-2 mb-2">
                          {format(slot.date, 'EEEE, MMMM do')}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-xs font-medium text-parchment/60 mt-1">
                          <span className="flex items-center gap-1.5 text-gold"><CalendarClock size={14} /> Start: {slot.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {slot.status === 'filled' ? (
                        <div 
                           onClick={() => navigate(`/scholar/${encodeURIComponent(slot.khateeb)}`)}
                           className="flex items-center gap-4 glass-card-light p-4 border border-gold/20 rounded-none cursor-pointer hover:border-gold/50 transition-colors group"
                        >
                           <div className="flex flex-col text-right">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold mb-1">Confirmed Khateeb</span>
                              <span className="font-black tracking-tight text-parchment text-lg flex items-center gap-2 justify-end group-hover:text-gold transition-colors">
                                {slot.khateeb} <UserCheck size={16} className="text-gold"/>
                              </span>
                           </div>
                        </div>
                      ) : (
                        <button onClick={() => slot.applicants === 0 ? setActiveTab('directory') : setShowApplicantsModal(i)} className="flex flex-col items-center justify-center p-4 border border-dashed border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors md:min-w-[160px] group cursor-pointer">
                           <span className="text-3xl font-black text-gold leading-none group-hover:scale-110 transition-transform">{slot.applicants}</span>
                           <span className="text-[9px] uppercase tracking-[0.2em] text-parchment font-bold mt-2">{slot.applicants === 0 ? 'Find Khateeb' : 'Applicants'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
              
              {/* Pending Requests */}
              <div className="mt-12 pt-8 border-t border-white/10">
                 <div className="mb-6">
                   <h2 className="text-2xl font-black tracking-tighter text-parchment mb-2">Pending Requests</h2>
                   <p className="text-sm text-parchment/60 font-light">Scholars requesting to join your network.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {pendingRequests.map((request, idx) => (
                     <div key={request.id} className="glass-card p-5 border border-white/5 hover:border-gold/30 transition-colors flex flex-col gap-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center font-bold text-lg border border-gold/20">
                           {request.name.charAt(0)}
                         </div>
                         <div>
                           <h4 className="font-bold text-parchment text-sm">{request.name}</h4>
                           <span className="text-[10px] text-parchment/40 uppercase tracking-widest">{request.date}</span>
                         </div>
                       </div>
                       <div className="bg-gold/5 border border-gold/10 px-3 py-2">
                         <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold/80 block mb-1">Proposed Slot</span>
                         <span className="text-xs text-parchment font-medium">Friday, {request.proposedDate} at 1:15 PM</span>
                       </div>
                       <p className="text-sm text-parchment/70 font-light bg-black/20 p-3 border-l-2 border-gold/50 italic line-clamp-2">
                         "{request.message}"
                       </p>                        <div className="flex gap-2 mt-auto pt-2">
                          <button 
                            onClick={() => {
                              setConfirmAction({
                                title: "Accept Khutbah Request",
                                message: `Are you sure you want to accept ${request.name} for Friday, ${request.proposedDate}? They will be notified.`, 
                                onConfirm: () => {
                                  setPendingRequests(prev => prev.filter(r => r.id !== request.id));
                                  const parsedDateString = request.proposedDate; 
                                  const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(parsedDateString.split(" ")[0]);
                                  const dateObj = new Date(new Date().getFullYear(), monthIdx > -1 ? monthIdx : 0, parseInt(parsedDateString.split(" ")[1] || "1"));
                                  
                                  setToastNotification({ message: `Request from ${request.name} accepted for ${request.proposedDate}. They have been notified.` });
                                  setNotifications(prev => [{type: "confirmed", message: `You accepted ${request.name}'s request for ${request.proposedDate}.`, time: "Just now"}, ...prev]);
                                  const responses = JSON.parse(localStorage.getItem("masjid_responses") || "[]");
                                  responses.push({ type: "accepted", masjid: profileData.name, imam: request.name, date: request.proposedDate });
                                  localStorage.setItem("masjid_responses", JSON.stringify(responses));
                                  window.dispatchEvent(new Event("masjid_responded"));
                                  setTimeout(() => setToastNotification(null), 5000);
                                }
                              });
                            }}
                            className="flex-[1] bg-gold text-forest hover:bg-gold-light px-2 py-2 text-[10px] uppercase font-bold tracking-[0.1em] transition-colors cursor-pointer"
                          >
                             Accept
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmAction({
                                title: "Decline Request",
                                message: `Are you sure you want to decline ${request.name}"s request?`,
                                onConfirm: () => {
                                  setPendingRequests(prev => prev.filter(r => r.id !== request.id));
                                  setToastNotification({ message: `Request from ${request.name} declined. They have been notified.` });
                                  setNotifications(prev => [{type: "rejected", message: `You declined ${request.name}'s request.`, time: "Just now"}, ...prev]);
                                  const responses = JSON.parse(localStorage.getItem("masjid_responses") || "[]");
                                  responses.push({ type: "declined", masjid: profileData.name, imam: request.name, date: request.proposedDate });
                                  localStorage.setItem("masjid_responses", JSON.stringify(responses));
                                  window.dispatchEvent(new Event("masjid_responded"));
                                  setTimeout(() => setToastNotification(null), 5000);
                                }
                              });
                            }}
                            className="flex-[1] bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 px-2 py-2 text-[10px] uppercase font-bold tracking-[0.1em] transition-colors cursor-pointer"
                          >
                             Decline
                          </button>
                          <button onClick={() => navigate(`/scholar/${encodeURIComponent(request.name)}`)} className="flex-[1.5] bg-transparent border border-parchment/20 text-parchment/60 hover:text-parchment px-2 py-2 text-[10px] uppercase font-bold tracking-[0.1em] transition-colors cursor-pointer truncate">
                             Profile
                          </button>
                          <button onClick={() => { setActiveChatUser(request.name); setActiveTab("current_chat"); }} className="bg-transparent border border-white/20 text-parchment/60 hover:text-gold hover:border-gold px-3 py-2 flex items-center justify-center transition-colors cursor-pointer shrink-0" title="Message">
                             <MessageSquare size={14} />
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
              
            </div>
          )}

          {activeTab === 'directory' && (
             <div className="animate-fade-in flex flex-col h-[600px] glass-card border border-white/5 rounded-none relative overflow-hidden">
               <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between z-10">
                 <div>
                   <h3 className="font-black text-2xl text-parchment tracking-tighter">Scholar Directory</h3>
                   <p className="text-parchment/50 font-light text-sm mt-1">Browse verified local scholars and invite them directly to an open slot.</p>
                 </div>
                 <div className="relative">
                   <input type="text" placeholder="Search..." value={scholarSearch} onChange={(e) => setScholarSearch(e.target.value)} className="bg-forest border border-white/10 text-parchment px-4 py-2 text-sm focus:outline-none focus:border-gold/50" />
                   <Search size={14} className="absolute right-3 top-3 text-parchment/40" />
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { name: 'Dr. Yasir Qadhi', location: 'Dallas, TX', expertise: 'Fiqh, Seerah', available: false },
                   { name: 'Imam Suhaib Webb', location: 'New York, NY', expertise: 'Youth, Tafsir', available: true },
                   { name: 'Mufti Menk', location: 'Zimbabwe', expertise: 'General, Youth', available: false },
                   { name: 'Omar Suleiman', location: 'Dallas, TX', expertise: 'Spirituality, Seerah', available: true },
                   { name: 'Dr. Ahmed Hassan', location: 'Chicago, IL', expertise: 'Aqeedah', available: true },
                   { name: 'Ustadh Nouman Ali Khan', location: 'Dallas, TX', expertise: 'Quranic Arabic', available: false },
                   { name: 'Shaykh Hamza Yusuf', location: 'Berkeley, CA', expertise: 'Theology, Fiqh', available: true }
                 ].map(imam => {
                    const savedStr = localStorage.getItem('khateeb_profile');
                    if (savedStr) {
                       try {
                          const kp = JSON.parse(savedStr);
                          if (imam.name === 'Dr. Ahmed Hassan' && kp && kp.name) {
                             return { ...imam, ...kp, name: kp.name }; 
                          }
                       } catch(e) {}
                    }
                    return { ...imam, avatarUrl: '' };
                  }).filter(imam => imam.name.toLowerCase().includes(scholarSearch.toLowerCase()) || (imam.location && imam.location.toLowerCase().includes(scholarSearch.toLowerCase())) || (imam.expertise && imam.expertise.toLowerCase().includes(scholarSearch.toLowerCase()))).map((imam, idx) => (
                   <div key={idx} onClick={() => navigate(`/scholar/${encodeURIComponent(imam.name)}`)} className="p-5 border border-white/5 bg-forest-light/30 hover:bg-white/5 hover:border-gold/30 transition-colors group relative flex flex-col cursor-pointer">
                     <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center font-bold text-lg border border-gold/20 overflow-hidden">
                           {(imam as any).avatarUrl ? <img src={(imam as any).avatarUrl} className="w-full h-full object-cover" alt={imam.name} /> : imam.name.charAt(0)}
                         </div>
                         <div>
                           <h4 className="font-bold text-parchment group-hover:text-gold transition-colors text-sm">{imam.name}</h4>
                           <p className="text-[10px] text-parchment/50 uppercase tracking-widest mt-0.5">{imam.location}</p>
                         </div>
                       </div>
                       <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 border ${imam.available ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                         {imam.available ? 'Available' : 'Booked'}
                       </span>
                     </div>
                     <p className="text-xs text-parchment/60 mb-4 line-clamp-2">
                       Expertise: {imam.expertise}
                     </p>
                     <div className="mt-auto pt-4 border-t border-white/5 flex gap-2 relative z-10">
                       <button onClick={(e) => { e.stopPropagation(); setActiveTab('current_chat'); setActiveChatUser(imam.name); setChatSearch(''); }} className="flex-1 bg-transparent hover:bg-white/5 text-parchment text-[10px] font-bold uppercase tracking-widest py-2 border border-white/10 transition-colors cursor-pointer">
                         Message
                       </button>
                       {invitedScholars.includes(imam.name) ? (
                         <button disabled onClick={(e) => e.stopPropagation()} className="flex-1 bg-gold/20 text-gold border border-gold/20 text-[10px] font-bold uppercase tracking-widest py-2">
                           Requested
                         </button>
                       ) : (
                         <button 
                           onClick={(e) => { e.stopPropagation(); setShowInviteModal(imam.name); }}
                           disabled={!imam.available} 
                           className="flex-1 bg-gold hover:bg-gold-light text-forest text-[10px] font-bold uppercase tracking-widest py-2 transition-colors disabled:opacity-50 disabled:bg-white/10 disabled:text-parchment/40 cursor-pointer"
                         >
                           Invite
                         </button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'messages' && (
             <div className="animate-fade-in flex flex-col h-[600px] glass-card border border-white/5 rounded-none relative overflow-hidden">
               <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between z-10">
                 <div>
                   <h3 className="font-black text-2xl text-parchment tracking-tighter">Inbox</h3>
                   <p className="text-parchment/50 font-light text-sm mt-1">Coordinate with your confirmed Khateebs.</p>
                 </div>
                 <button onClick={() => setActiveTab('new_chat')} className="bg-gold hover:bg-gold-light text-forest px-4 py-2 rounded-none font-bold text-xs tracking-widest uppercase inline-flex items-center gap-2 transition-colors cursor-pointer border border-gold/50 shadow-[0_0_15px_rgba(231,111,81,0.2)]">
                   <Plus size={16} /> New Chat
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto z-10">
                 <div 
                   className="p-6 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                   onClick={() => { setActiveChatUser('Dr. Yasir Qadhi'); setActiveTab('current_chat'); }}
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-forest-light text-gold border border-gold/20 flex items-center justify-center font-bold text-xl relative">
                       Y
                       <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-forest"></span>
                     </div>
                     <div>
                       <h4 className="font-bold text-parchment group-hover:text-gold transition-colors">Dr. Yasir Qadhi</h4>
                       <p className="text-sm text-parchment/60 mt-1 line-clamp-1">As-salamu alaykum, I will be arriving around 1:00 PM next Friday.</p>
                     </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className="text-[10px] text-parchment/40 uppercase font-bold tracking-widest">Yesterday</span>
                   </div>
                 </div>
                 <div 
                   className="p-6 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group opacity-70 hover:opacity-100"
                   onClick={() => { setActiveChatUser('Imam Suhaib Webb'); setActiveTab('current_chat'); }}
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-forest-light text-parchment/50 border border-parchment/10 flex items-center justify-center font-bold text-xl">
                       S
                     </div>
                     <div>
                       <h4 className="font-bold text-parchment group-hover:text-gold transition-colors">Imam Suhaib Webb</h4>
                       <p className="text-sm text-parchment/60 mt-1 line-clamp-1">Wa iyyakum.</p>
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
               <p className="text-parchment/50 font-light text-sm max-w-sm mx-auto leading-relaxed mb-8">Enter the name of a Khateeb or Scholar to start a secure thread.</p>
               <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                 <div className="relative w-full">
                   <input 
                     type="text" 
                     placeholder="Search Scholar Name..." 
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
                       {filteredScholars.length > 0 ? (
                         filteredScholars.map((scholar, idx) => (
                           <div 
                             key={idx} 
                             className="p-3 hover:bg-white/5 cursor-pointer text-sm text-parchment border-b border-white/5 last:border-0"
                             onMouseDown={(e) => {
                               e.preventDefault();
                               setChatSearch(scholar.name || scholar.id);
                               setActiveChatUserId(scholar.id);
                               setShowSuggestions(false);
                             }}
                           >
                             {scholar.name || `Khateeb ${scholar.id.slice(0,4)}`}
                           </div>
                         ))
                       ) : (
                         <div className="p-3 text-sm text-parchment/50">No scholars found matching "{chatSearch}"</div>
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
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center font-bold text-lg border border-gold/20">
                       {activeChatUser?.charAt(0) || '?'}
                     </div>
                     <div>
                       <h4 className="font-bold text-parchment text-sm">{activeChatUser}</h4>
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
               <h3 className="font-black text-3xl text-parchment mb-8 tracking-tighter">Organization Settings</h3>
               
               <div className="space-y-8 text-left">
                 <div>
                   <h4 className="text-sm font-bold text-gold uppercase tracking-[0.2em] mb-4">Masjid Details</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Organization Name</label>
                       <input type="text" value={profileData.name} onChange={(e) => updateProfileData('name', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Address</label>
                       <AddressAutocomplete 
                         value={profileData.address || ''} 
                         onChange={(value) => updateProfileData('address', value)} 
                         className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" 
                       />
                     </div>
                   </div>
                   <div className="space-y-2 mb-6">
                     <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Website (Optional)</label>
                     <input type="text" value={profileData.website} onChange={(e) => updateProfileData('website', e.target.value)} placeholder="www.example.com" className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                   </div>
                   <div className="space-y-2 mb-6">
                     <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">About the Organization</label>
                     <textarea rows={4} value={profileData.description} onChange={(e) => updateProfileData('description', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors resize-none"></textarea>
                   </div>
                   <div className="space-y-2 mb-6">
                     <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Key Priorities (Comma Separated)</label>
                     <input type="text" value={profileData.focusAreas} onChange={(e) => updateProfileData('focusAreas', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Jumuah Start Time</label>
                       <input type="text" value={profileData.jumuahTime} onChange={(e) => updateProfileData('jumuahTime', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Languages</label>
                       <input type="text" value={profileData.languages} onChange={(e) => updateProfileData('languages', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Avg. Attendees</label>
                       <input type="text" value={profileData.avgAttendees} onChange={(e) => updateProfileData('avgAttendees', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                   </div>
                   <h4 className="text-sm font-bold text-gold uppercase tracking-[0.2em] mb-4 mt-8">Contact Information</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Phone Number</label>
                       <input type="text" value={profileData.phone} onChange={(e) => updateProfileData('phone', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Contact Email</label>
                       <input type="email" value={profileData.email} onChange={(e) => updateProfileData('email', e.target.value)} className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 transition-colors" />
                     </div>
                   </div>
                 </div>

                 <div>
                   <h4 className="text-sm font-bold text-gold uppercase tracking-[0.2em] mb-4">Media & Documents</h4>
                   
                   <div 
                     className="border border-dashed border-white/20 p-8 text-center hover:bg-white/5 transition-colors cursor-pointer"
                     onClick={logoUpload.handleThumbnailClick}
                   >
                     {logoUpload.uploading ? (
                       <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-gold/30 border-t-gold animate-spin"></div>
                     ) : logoUpload.previewUrl ? (
                        <div className="relative w-24 h-24 mx-auto mb-4">
                           <img src={logoUpload.previewUrl} alt="Logo preview" className="w-full h-full object-cover rounded-full" />
                           <button 
                             onClick={(e) => { e.stopPropagation(); logoUpload.handleRemove(); }} 
                             className="absolute -top-2 -right-2 bg-red-500 text-parchment rounded-full p-1 z-10"
                           >
                             <X size={12} />
                           </button>
                        </div>
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-forest-light border border-white/10 flex items-center justify-center mx-auto mb-4 text-gold">
                          <Building size={20} />
                        </div>
                     )}
                     <p className="text-sm text-parchment font-bold mb-1">Upload Organization Logo</p>
                     <p className="text-xs text-parchment/50 text-ellipsis overflow-hidden whitespace-nowrap">
                       {logoUpload.uploading ? `Uploading ${Math.round(logoUpload.uploadProgress)}%` : logoUpload.fileName || "JPG, PNG up to 5MB"}
                     </p>
                     <input 
                       type="file" 
                       ref={logoUpload.fileInputRef} 
                       onChange={logoUpload.handleFileChange} 
                       className="hidden" 
                       accept="image/jpeg,image/png" 
                     />
                   </div>

                   <div 
                     className="border border-dashed border-white/20 p-8 text-center hover:bg-white/5 transition-colors cursor-pointer mt-4"
                     onClick={taxUpload.handleThumbnailClick}
                   >
                     {taxUpload.uploading ? (
                       <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-gold/30 border-t-gold animate-spin"></div>
                     ) : taxUpload.previewUrl ? (
                        <div className="relative w-24 h-24 mx-auto mb-4 flex py-2 bg-forest-light items-center justify-center text-parchment rounded-sm">
                           <div className="text-xs text-center truncate px-2">{taxUpload.fileName || "Document Verified"}</div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); taxUpload.handleRemove(); }} 
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
                     <p className="text-sm text-parchment font-bold mb-1">Upload Tax Exemption / 501(c)(3)</p>
                     <p className="text-xs text-parchment/50 text-ellipsis overflow-hidden whitespace-nowrap">
                       {taxUpload.uploading ? `Uploading ${Math.round(taxUpload.uploadProgress)}%` : taxUpload.fileName || "PDF or Image up to 10MB"}
                     </p>
                     <input 
                       type="file" 
                       ref={taxUpload.fileInputRef} 
                       onChange={taxUpload.handleFileChange} 
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

        {showInviteModal !== null && (
          <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <div className="glass-card max-w-lg w-full border border-gold/20 p-8 shadow-2xl relative">
              <button 
                onClick={() => setShowInviteModal(null)} 
                className="absolute top-6 right-6 text-parchment/60 hover:text-gold transition-colors cursor-pointer"
              >
                 <X size={24} />
              </button>
              <h3 className="font-black text-2xl text-parchment mb-2 tracking-tighter">Invite Khateeb</h3>
              <p className="text-parchment/60 font-light text-sm mb-8">Send an invitation to {showInviteModal}.</p>
              
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
                    setInvitedScholars(prev => [...prev, showInviteModal]);
                    setShowInviteModal(null);
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

        {showPostSlotModal && (
          <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <div className="glass-card max-w-lg w-full border border-gold/20 p-8 shadow-2xl relative animate-fade-in">
              <button 
                onClick={() => setShowPostSlotModal(false)} 
                className="absolute top-6 right-6 text-parchment/60 hover:text-gold transition-colors cursor-pointer"
              >
                 <X size={24} />
              </button>
              <h3 className="font-black text-2xl text-parchment mb-2 tracking-tighter">Post New Slot</h3>
              <p className="text-parchment/60 font-light text-sm mb-8">Open a slot to receive applications from local Khateebs.</p>
              
              <div className="space-y-6 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Date</label>
                    <DatePicker date={postSlotDate} onDateChange={setPostSlotDate} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Time</label>
                    <TimePicker />
                  </div>
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
                  <label className="text-xs text-parchment/60 uppercase tracking-widest font-bold">Requirements / Notes</label>
                  <textarea rows={3} placeholder="Any specific topic requests or requirements..." className="w-full bg-forest-light/40 border border-white/10 rounded-none px-4 py-3 text-parchment focus:outline-none focus:border-gold/50 resize-none" />
                </div>
                
                <button 
                  onClick={async () => {
                    if (postSlotDate) {
                      await createSlot({
                        date: postSlotDate,
                        time: '1:15 PM', // Default mock time for now
                        hadiyyaAmount: hadiyyaAmount || '$0'
                      });
                      setToastNotification({ message: 'Slot published successfully.' });
                      setTimeout(() => setToastNotification(null), 5000);
                    }
                    setShowPostSlotModal(false);
                    setHadiyyaAmount('');
                  }} 
                  className="w-full bg-gold hover:bg-gold-light text-forest text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 transition-all shadow-[0_0_15px_rgba(231,111,81,0.2)] mt-4 cursor-pointer"
                >
                  Publish Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {showApplicantsModal !== null && (
          <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <div className="glass-card max-w-2xl w-full border border-gold/20 p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
              <button 
                onClick={() => setShowApplicantsModal(null)} 
                className="absolute top-6 right-6 text-parchment/60 hover:text-gold transition-colors cursor-pointer"
              >
                 <X size={24} />
              </button>
              <h3 className="text-2xl font-black text-parchment mb-2 tracking-tighter">View Applicants</h3>
              <p className="text-sm text-parchment/60 font-medium mb-8">
                Select a Khateeb for {format(postedSlots[showApplicantsModal].date, 'EEEE, MMMM do')}
              </p>
              
              <div className="space-y-4 overflow-y-auto pr-2 pb-4">
                {[
                  { name: 'Imam Suhaib Webb', distance: '12 miles away', rating: 4.9, reviews: 124 },
                  { name: 'Dr. Ahmed Hassan', distance: '5 miles away', rating: 4.8, reviews: 86 },
                ].map((applicant, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-4 border border-white/5 hover:border-gold/30 bg-white/5 hover:bg-gold/5 transition-all group">
                    <div 
                      className="w-16 h-16 rounded-full bg-forest-light border border-gold/20 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/scholar/${encodeURIComponent(applicant.name)}`)}
                    >
                      <User size={24} className="text-gold" />
                    </div>
                    <div className="flex-1 text-center md:text-left cursor-pointer" onClick={() => navigate(`/scholar/${encodeURIComponent(applicant.name)}`)}>
                       <h4 className="font-bold text-parchment text-lg hover:text-gold transition-colors block">{applicant.name}</h4>
                       <div className="flex items-center justify-center md:justify-start gap-4 mt-1 text-xs text-parchment/60 font-medium">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-gold/60"/> {applicant.distance}</span>
                          <span className="flex items-center gap-1 text-gold"><Star size={12} fill="currentColor"/> {applicant.rating} ({applicant.reviews})</span>
                       </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 shrink-0">
                       <button 
                         onClick={() => {
                           setConfirmAction({
                             title: "Approve Khateeb",
                             message: `Are you sure you want to approve ${applicant.name} for this Friday slot?`,
                             onConfirm: () => {
                               setShowApplicantsModal(null);
                               setToastNotification({ message: `${applicant.name} approved. They have been notified.` });
                               setNotifications(prev => [{type: "confirmed", message: `You approved ${applicant.name} for the Khutbah slot.`, time: "Just now"}, ...prev]);
                               const responses = JSON.parse(localStorage.getItem("masjid_responses") || "[]");
                               responses.push({ type: "approved", masjid: profileData.name, imam: applicant.name });
                               localStorage.setItem("masjid_responses", JSON.stringify(responses));
                               window.dispatchEvent(new Event("masjid_responded"));
                               setTimeout(() => setToastNotification(null), 5000);
                             }
                           });
                         }}
                         className="flex-1 md:flex-none bg-gold text-forest hover:bg-gold-light px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors cursor-pointer"
                       >
                          Approve
                       </button>
                       <button 
                         onClick={() => {
                           setConfirmAction({
                             title: 'Deny Applicant',
                             message: `Are you sure you want to deny ${applicant.name}'s application?`,
                             onConfirm: () => {
                               setShowApplicantsModal(null);
                               setToastNotification({ message: `${applicant.name}'s application denied. They have been notified.` });
                               setNotifications(prev => [{type: "rejected", message: `You denied ${applicant.name}'s application.`, time: "Just now"}, ...prev]);
                               const responses = JSON.parse(localStorage.getItem("masjid_responses") || "[]");
                               responses.push({ type: "denied", masjid: profileData.name, imam: applicant.name });
                               localStorage.setItem("masjid_responses", JSON.stringify(responses));
                               window.dispatchEvent(new Event("masjid_responded"));
                               setTimeout(() => setToastNotification(null), 5000);
                             }
                           });
                         }}
                         className="flex-1 md:flex-none bg-transparent border border-white/20 text-parchment/60 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors cursor-pointer"
                       >
                          Deny
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showSlotDetailsModal !== null && (
          <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
            <div className="glass-card max-w-lg w-full border border-gold/20 p-8 shadow-2xl relative flex flex-col">
              <button 
                onClick={() => setShowSlotDetailsModal(null)} 
                className="absolute top-6 right-6 text-parchment/60 hover:text-gold transition-colors cursor-pointer"
              >
                 <X size={24} />
              </button>
              <h3 className="text-2xl font-black text-parchment mb-2 tracking-tighter">Slot Details</h3>
              <p className="text-sm text-parchment/60 font-medium mb-8">
                {format(postedSlots[showSlotDetailsModal].date, 'EEEE, MMMM do, yyyy')}
              </p>
              
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-parchment/50 mb-1 block">Status</span>
                  <span className="inline-block px-3 py-1 bg-gold text-forest text-[10px] font-bold uppercase tracking-widest">Filled</span>
                </div>
                
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-parchment/50 mb-1 block">Assigned Khateeb</span>
                  <span 
                     className="font-bold text-parchment flex items-center gap-2 cursor-pointer hover:text-gold transition-colors text-lg" 
                     onClick={() => navigate(`/scholar/${encodeURIComponent(postedSlots[showSlotDetailsModal].khateeb!)}`)}
                  >
                    {postedSlots[showSlotDetailsModal].khateeb} <UserCheck size={16} className="text-gold"/>
                  </span>
                </div>
                
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-parchment/50 mb-1 block">Time</span>
                  <span className="font-bold text-parchment">{postedSlots[showSlotDetailsModal].time}</span>
                </div>
                
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-parchment/50 mb-1 block">Hadiyya</span>
                  <span className="font-bold text-parchment">{postedSlots[showSlotDetailsModal].hadiyah}</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
                 <button onClick={() => navigate(`/scholar/${encodeURIComponent(postedSlots[showSlotDetailsModal].khateeb!)}`)} className="flex-1 bg-gold hover:bg-gold-light text-forest text-[10px] uppercase font-bold tracking-[0.2em] px-6 py-4 transition-colors cursor-pointer">
                    View Profile
                 </button>
                 <button onClick={() => { setActiveChatUser(postedSlots[showSlotDetailsModal].khateeb); setActiveTab('messages'); setShowSlotDetailsModal(null); }} className="flex-1 bg-transparent border border-white/20 text-parchment hover:bg-white/5 text-[10px] uppercase font-bold tracking-[0.2em] px-6 py-4 transition-colors cursor-pointer">
                    Message
                 </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-forest border-t border-white/10 z-50 flex justify-around items-center pb-safe">
         <button onClick={() => setActiveTab('slots')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'slots' ? 'text-gold' : 'text-parchment/40'}`}>
            <CalendarClock size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Dashboard</span>
         </button>
         <button onClick={() => setActiveTab('directory')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'directory' ? 'text-gold' : 'text-parchment/40'}`}>
            <Search size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Scholars</span>
         </button>
         <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'messages' ? 'text-gold' : 'text-parchment/40'}`}>
            <MessageSquare size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Inbox</span>
         </button>
         <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center py-4 px-4 flex-1 ${activeTab === 'profile' ? 'text-gold' : 'text-parchment/40'}`}>
            <Building size={22} />
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5">Profile</span>
         </button>
      </div>

      {/* Global Toast */}
      {toastNotification && (
        <div className="fixed bottom-24 md:bottom-8 right-8 z-50 animate-fade-in pointer-events-none">
          <div className="bg-forest-light border border-gold/40 shadow-[0_0_20px_rgba(231,111,81,0.2)] p-4 max-w-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center shrink-0 border border-gold/20">
              <Bell size={20} />
            </div>
            <div>
              <h4 className="font-bold text-parchment text-sm">New Notification</h4>
              <p className="text-xs text-parchment/70 mt-1">{toastNotification.message}</p>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-forest/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
          <div className="glass-card max-w-sm w-full border border-gold/20 p-8 shadow-2xl relative animate-fade-in text-center">
            <h3 className="text-xl font-black text-parchment tracking-tighter mb-2">{confirmAction.title}</h3>
            <p className="text-sm text-parchment/60 font-light mb-8">{confirmAction.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmAction(null)} className="flex-1 border border-parchment/20 text-parchment/60 hover:text-parchment px-4 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors cursor-pointer">
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

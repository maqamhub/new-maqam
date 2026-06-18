import React, { useState } from 'react';
import { 
  Users, Activity, Building, Settings, 
  MapPin, AlertCircle, ShieldBan, Menu, 
  X, CheckCircle, Clock, Calendar, UserPlus, Plus
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { motion } from 'motion/react';
import { useUsers } from '../hooks/useUsers';
import { useAllSlots } from '../hooks/useMasjidSlots';
import { useAdmin } from '../hooks/useAdmin';
import { format } from 'date-fns';

const mockData = {
  traffic: [
    { day: 'Mon', visits: 120, matches: 5 },
    { day: 'Tue', visits: 132, matches: 8 },
    { day: 'Wed', visits: 101, matches: 4 },
    { day: 'Thu', visits: 170, matches: 15 },
    { day: 'Fri', visits: 290, matches: 45 },
    { day: 'Sat', visits: 90, matches: 2 },
    { day: 'Sun', visits: 110, matches: 3 },
  ]
};

export default function PlatformAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ type: 'khateeb', name: '' });

  const { isAdmin, loading: adminLoading } = useAdmin();
  const { users, updateUser, createUser } = useUsers();
  const { slots: bookings, updateSlot: updateBooking } = useAllSlots();

  const handleAction = async (id: string, action: 'verify' | 'suspend') => {
    await updateUser(id, { status: action === 'verify' ? 'verified' : 'suspended' });
  };

  const handleBookingAction = async (id: string, action: 'confirm' | 'deny' | 'cancel') => {
    let newStatus: any = 'open';
    if (action === 'confirm') newStatus = 'filled';
    if (action === 'deny' || action === 'cancel') newStatus = 'cancelled';
    await updateBooking(id, { status: newStatus });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name) return;
    await createUser({
      name: newUser.name,
      account_type: newUser.type,
      status: 'verified'
    });
    setShowAddUser(false);
    setNewUser({ type: 'khateeb', name: '' });
  };

  if (adminLoading) {
    return <div className="min-h-screen bg-sandstone flex items-center justify-center text-navy font-bold">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-sandstone flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 border border-sandstone shadow-xl text-center max-w-md w-full">
        <ShieldBan size={48} className="mx-auto text-red-600 mb-4" />
        <h1 className="text-2xl font-black text-navy mb-2">Access Denied</h1>
        <p className="text-navy/70 mb-6">You do not have administrative privileges to view this portal.</p>
        <a href="/" className="inline-block bg-navy text-white px-6 py-3 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-navy-light cursor-pointer">Return Home</a>
      </div>
    </div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'bookings', label: 'Master Bookings', icon: Calendar },
    { id: 'issues', label: 'Customer Issues', icon: AlertCircle },
    { id: 'settings', label: 'Platform Controls', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-sandstone flex flex-col md:flex-row">
      <div className="md:hidden bg-navy text-forest-light p-4 flex items-center justify-between z-20 sticky top-0">
        <div className="font-serif font-bold text-xl tracking-tighter text-gold">MIMBAR<span className="text-forest-light">HQ</span></div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`fixed inset-0 z-10 md:static md:w-64 bg-navy text-forest-light flex-col transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 hidden md:block">
          <div className="font-serif font-bold text-2xl tracking-tighter text-gold mb-1">MIMBAR<span className="text-white">HQ</span></div>
          <div className="text-forest text-xs font-bold uppercase tracking-[0.2em]">Super Admin</div>
        </div>
        
        <nav className="flex-1 px-4 py-8 md:py-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-forest/50 text-gold border-r-2 border-gold" : "text-white/70 hover:bg-parchment/5 hover:text-white"}`}
              >
                <Icon size={18} className={isActive ? "text-gold" : "opacity-70"} />
                <span className="uppercase tracking-wider text-[11px] font-bold">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-ivory/50">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
           {activeTab === 'overview' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-navy tracking-tighter">Command Center</h1>
                    <p className="text-navy/60 font-medium">Real-time platform analytics and traffic monitoring.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Masjids', value: users.filter(u => u.account_type === 'masjid').length, icon: Building, color: 'text-emerald-700' },
                    { label: 'Verified Khateebs', value: users.filter(u => u.account_type === 'khateeb' && (u.status === 'verified' || !u.status)).length, icon: Users, color: 'text-navy' },
                    { label: 'Successful Matches', value: bookings.filter(b => b.status === 'filled').length, icon: CheckCircle, color: 'text-gold-dark' },
                    { label: 'Pending Verifications', value: users.filter(u => u.status === 'pending').length, icon: Clock, color: 'text-red-600' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 border border-sandstone shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-navy/50">{stat.label}</span>
                        <stat.icon size={16} className={stat.color} />
                      </div>
                      <div className="text-3xl font-black tracking-tighter text-navy">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white p-6 border border-sandstone shadow-sm h-[400px]">
                    <h3 className="text-xs uppercase font-bold tracking-widest text-navy mb-6">Traffic (Visits vs Matches)</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <LineChart data={mockData.traffic}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1a365d', border: 'none', color: '#fff', borderRadius: '0' }} />
                        <Line type="monotone" dataKey="visits" stroke="#1a365d" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="matches" stroke="#d4af37" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-white p-6 border border-sandstone shadow-sm h-[400px]">
                    <h3 className="text-xs uppercase font-bold tracking-widest text-navy mb-6">Weekly Engagement</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={mockData.traffic}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0' }} />
                        <Bar dataKey="visits" fill="#2d5a27" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="matches" fill="#d4af37" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'users' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-navy tracking-tighter">User Master Directory</h1>
                    <p className="text-navy/60 font-medium">Manage and verify all accounts on the platform.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddUser(!showAddUser)}
                    className="bg-navy hover:bg-navy-light text-white font-bold uppercase tracking-widest text-[10px] px-6 py-3 transition-colors flex items-center gap-2"
                  >
                    <UserPlus size={16} /> Onboard New User
                  </button>
                </div>

                {showAddUser && (
                  <div className="bg-white border border-sandstone shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-navy mb-4">Manual User Onboarding</h3>
                    <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-2">Account Type</label>
                        <select 
                          className="w-full bg-sandstone/20 border border-sandstone p-3 text-navy font-medium outline-none focus:border-navy"
                          value={newUser.type}
                          onChange={(e) => setNewUser({...newUser, type: e.target.value})}
                        >
                          <option value="Khateeb">Khateeb</option>
                          <option value="Masjid">Masjid</option>
                        </select>
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-2">Entity / Full Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-sandstone/20 border border-sandstone p-3 text-navy font-semibold outline-none focus:border-navy"
                          placeholder="e.g. Dr. Yasir Qadhi"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        />
                      </div>
                      <button type="submit" className="bg-forest hover:bg-forest-light text-white font-bold uppercase tracking-widest text-[10px] px-8 py-3.5 transition-colors h-fit shrink-0">
                        Add User
                      </button>
                    </form>
                  </div>
                )}

                <div className="bg-white border border-sandstone shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-sandstone/30 border-b border-sandstone">
                        <tr>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">User / Entity</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">Type</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">Status</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">Joined</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sandstone">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-ivory/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-navy tracking-tight">{user.name}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-1 bg-navy/5 text-navy font-medium rounded-sm border border-navy/10">{user.account_type || 'Unknown'}</span>
                            </td>
                            <td className="px-6 py-4">
                              {(!user.status || user.status === 'verified') && <span className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1"><CheckCircle size={14}/> Verified</span>}
                              {user.status === 'pending' && <span className="text-xs font-bold uppercase tracking-wider text-gold-dark flex items-center gap-1"><Clock size={14}/> Pending</span>}
                              {user.status === 'flagged' && <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1"><AlertCircle size={14}/> Flagged</span>}
                              {user.status === 'suspended' && <span className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1"><ShieldBan size={14}/> Suspended</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-navy/70 font-medium">{user.created_at ? (user.created_at.toDate ? format(user.created_at.toDate(), 'MMM d, yyyy') : format(new Date(user.created_at), 'MMM d, yyyy')) : 'Recently'}</td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                              {(user.status !== 'verified' && user.status !== undefined) && (
                                <button onClick={() => handleAction(user.id, 'verify')} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-forest text-white hover:bg-forest-light transition-colors">Verify</button>
                              )}
                              {user.status !== 'suspended' && (
                                <button onClick={() => handleAction(user.id, 'suspend')} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Suspend</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'bookings' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-navy tracking-tighter">Master Bookings & Overrides</h1>
                    <p className="text-navy/60 font-medium">Force approve or deny requests across the entire platform.</p>
                  </div>
                </div>

                <div className="bg-white border border-sandstone shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-sandstone/30 border-b border-sandstone">
                        <tr>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">Date</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">Masjid</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">Khateeb</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60">Status</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-navy/60 text-right">Master Overrides</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sandstone">
                        {bookings.map(booking => (
                          <tr key={booking.id} className="hover:bg-ivory/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-navy/80">{booking.date ? format(booking.date, 'MMM d, yyyy') : 'Unknown Date'}</td>
                            <td className="px-6 py-4 font-bold text-navy tracking-tight">{users.find(u => u.id === booking.masjidId)?.name || 'Unknown Masjid'}</td>
                            <td className="px-6 py-4 font-medium text-navy/90">{booking.khateebName || users.find(u => u.id === booking.khateebId)?.name || 'None Assigned'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 border rounded-sm ${
                                booking.status === 'filled' ? 'text-forest bg-forest/5 border-forest/20' : 
                                booking.status === 'open' ? 'text-gold-dark bg-gold/10 border-gold/30' : 
                                booking.status === 'cancelled' ? 'text-navy/50 bg-navy/5 border-navy/10' :
                                'text-red-600 bg-red-50 border-red-200'
                              }`}>{booking.status === 'filled' ? 'Confirmed' : booking.status}</span>
                            </td>
                            <td className="px-6 py-4 flex justify-end gap-2">
                              {booking.status === 'open' && (
                                <>
                                  <button onClick={() => handleBookingAction(booking.id, 'cancel')} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Cancel Slot</button>
                                </>
                              )}
                              {booking.status === 'filled' && (
                                <button onClick={() => handleBookingAction(booking.id, 'cancel')} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Cancel Booking</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'issues' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-navy tracking-tighter">Customer Issues</h1>
                    <p className="text-navy/60 font-medium">Review reported no-shows, disputes, and account flags.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                   <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">High Priority</span>
                          <span className="text-xs text-navy/50 font-medium">Reported 2 hours ago</span>
                        </div>
                        <h4 className="font-bold text-navy text-lg">Khateeb No-Show at Darul Arqam</h4>
                        <p className="text-sm text-navy/70 mt-1">Masjid reported that "Unknown User 104" failed to show up for Friday prayer on June 5th.</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                         <button className="px-4 py-2 bg-navy text-white text-[10px] font-bold uppercase tracking-widest hover:bg-navy-light transition-colors">Contact Masjid</button>
                         <button className="px-4 py-2 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors">Suspend Khateeb</button>
                      </div>
                   </div>
                   
                   <div className="bg-white border-l-4 border-gold p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-gold/20 text-gold-dark text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">Dispute</span>
                          <span className="text-xs text-navy/50 font-medium">Reported 1 day ago</span>
                        </div>
                        <h4 className="font-bold text-navy text-lg">Incorrect Hadiya Amount</h4>
                        <p className="text-sm text-navy/70 mt-1">Imam Suhaib Webb reported receiving less than the agreed amount from an unverified masjid.</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                         <button className="px-4 py-2 bg-navy text-white text-[10px] font-bold uppercase tracking-widest hover:bg-navy-light transition-colors">Review Log</button>
                      </div>
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'settings' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-navy tracking-tighter">System Controls</h1>
                    <p className="text-navy/60 font-medium">Global settings and master toggles.</p>
                  </div>
                </div>

                <div className="bg-white border border-sandstone shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-sandstone">
                    <div>
                      <h4 className="font-bold text-navy">Allow Automatic Verification</h4>
                      <p className="text-sm text-navy/60 mt-1 max-w-md">Automatically verify Imams matching database records without manual review.</p>
                    </div>
                    <div className="w-12 h-6 bg-forest rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-6 border-b border-sandstone">
                    <div>
                      <h4 className="font-bold text-navy">Maintenance Mode</h4>
                      <p className="text-sm text-navy/60 mt-1 max-w-md">Suspend all new bookings and show maintenance screen.</p>
                    </div>
                    <div className="w-12 h-6 bg-sandstone-dark rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                     <button className="bg-navy hover:bg-navy-light text-white font-bold uppercase tracking-widest text-[10px] px-6 py-3 transition-colors">
                       Save Configuration
                     </button>
                  </div>
                </div>
             </motion.div>
           )}
        </main>
      </div>
    </div>
  );
}

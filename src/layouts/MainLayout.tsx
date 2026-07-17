/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode } from 'react';
import { useSynapse } from '../contexts/SynapseContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SearchBar } from '../components/ui/Input';
import { Bell, Settings, LogOut, Shield, Compass, User, RefreshCw, Layers } from 'lucide-react';

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { activeRole, notifications, markAllNotificationsRead, clearNotifications } = useSynapse();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    setShowProfileCard(false);
    navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cognitive Global Search:', searchVal);
  };

  const currentPathName = location.pathname;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      {/* Soft elegant architectural lighting blobs at corners (Premium sports app style) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main header bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left branding */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="relative w-9 h-9 flex items-center justify-center bg-blue-600 rounded-lg overflow-hidden shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-all">
            <span className="text-white font-bold font-mono text-base tracking-tighter">S</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-100 uppercase group-hover:text-blue-400 transition-colors">
              FIFA Synapse
            </h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase leading-none">
              Smart Stadium Intelligence
            </p>
          </div>
        </div>

        {/* Dynamic Global Search (Enterprise-SaaS tier) */}
        {user && (
          <form 
            onSubmit={handleGlobalSearch} 
            className="hidden md:flex flex-1 max-w-sm mx-8"
          >
            <SearchBar
              placeholder="Search sections, concession queues, active protocols..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="py-1.5 px-3 bg-slate-950/50 border-slate-900 focus:border-slate-800 text-xs"
            />
          </form>
        )}

        {/* Global actions panel */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Notifications Stream Portal */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-1.5 rounded-lg border transition-all relative cursor-pointer ${
                    showNotifications 
                      ? 'bg-slate-900 border-slate-700 text-amber-400' 
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label="Toggle notifications stream"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                </button>

                {/* Notifications dropdown list */}
                {showNotifications && (
                  <Card className="absolute right-0 mt-2 w-80 z-50 p-4 border border-slate-800 bg-slate-950/90 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                        Synapse Stream
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={markAllNotificationsRead} 
                          className="text-[9px] text-blue-400 hover:text-blue-300 font-mono cursor-pointer"
                        >
                          Mark all read
                        </button>
                        <button 
                          onClick={clearNotifications} 
                          className="text-[9px] text-rose-400 hover:text-rose-300 font-mono cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-2 rounded border transition-colors ${
                              notif.read 
                                ? 'bg-slate-950/20 border-slate-900/60' 
                                : 'bg-slate-900/40 border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold font-sans ${
                                notif.severity === 'critical' 
                                  ? 'text-rose-400' 
                                  : notif.severity === 'warning' 
                                  ? 'text-amber-400' 
                                  : 'text-blue-400'
                              }`}>
                                {notif.title}
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-[10px] text-slate-500 py-6 font-mono">
                          Zero pending signals.
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                      className="w-full text-[10px]"
                    >
                      View All Notifications
                    </Button>
                  </Card>
                )}
              </div>

              {/* Settings navigation button */}
              <button
                onClick={() => navigate('/settings')}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  currentPathName === '/settings'
                    ? 'bg-slate-900 border-slate-700 text-blue-400'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
                aria-label="Navigate to settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Dynamic Session trigger card */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileCard(!showProfileCard)}
                  className="flex items-center space-x-2 p-1 pl-1 pr-2.5 rounded-lg border border-slate-900 bg-slate-950/40 hover:bg-slate-900/50 transition-colors cursor-pointer"
                  aria-label="User session menu"
                >
                  <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-[11px] font-bold">
                    {user.displayName.charAt(0)}
                  </div>
                  <span className="text-xs font-mono text-slate-300 hidden sm:inline max-w-[110px] truncate">
                    {user.displayName}
                  </span>
                </button>

                {showProfileCard && (
                  <Card className="absolute right-0 mt-2 w-56 z-50 p-4 border border-slate-800 bg-slate-950/90 shadow-2xl space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">
                        Cockpit Operator
                      </span>
                      <p className="text-xs font-bold text-slate-200 font-sans">{user.displayName}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                    </div>

                    <div className="border-t border-slate-900 pt-2 space-y-1">
                      <button
                        onClick={() => { setShowProfileCard(false); navigate('/profile'); }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-900 text-xs text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>Profile Space</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-950/30 text-xs text-rose-400 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs font-mono font-bold"
            >
              Operator Log In
            </Button>
          )}
        </div>
      </header>

      {/* Body content */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 focus:outline-none">
        {children}
      </main>

      {/* Footnote */}
      <footer className="border-t border-slate-900/60 py-5 px-4 text-center text-[10px] text-slate-500 font-mono tracking-wide">
        FIFA SYNAPSE © 2026 | COGNITIVE DECISION INTELLIGENCE NODE | PORT: 3000
      </footer>
    </div>
  );
}

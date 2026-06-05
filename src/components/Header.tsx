import { Bell, LogOut, Search, Menu, X, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: { key: string; label: string; icon: React.ReactNode; count?: number }[];
}

export default function Header({ searchQuery, onSearchChange, activeTab, onTabChange, tabs }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  const isTeacher = profile?.role === 'teacher';

  return (
    <header className="bg-gradient-hero border-b border-[#334155] sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${isTeacher ? 'bg-gradient-amber-orange shadow-amber-500/30' : 'bg-gradient-emerald-violet shadow-emerald-500/30'}`}>
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-sm leading-tight">Notice Board</h1>
              <p className={`text-xs font-medium ${isTeacher ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                {isTeacher ? 'Teacher Portal' : 'Student Portal'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-colors"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 glass-dark">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isTeacher ? 'bg-[#F59E0B]/20' : 'bg-[#10B981]/20'}`}>
                {isTeacher ? <BookOpen className={`w-3.5 h-3.5 text-[#F59E0B]`} /> : <GraduationCap className="w-3.5 h-3.5 text-[#10B981]" />}
              </div>
              <div>
                <p className="text-white text-xs font-medium leading-tight">{profile?.full_name || 'User'}</p>
                <p className={`text-xs capitalize leading-tight ${isTeacher ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>{profile?.role}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-9 h-9 bg-[#1E293B] border border-[#334155] rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444]/50 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenu(m => !m)}
              className="sm:hidden w-9 h-9 bg-[#1E293B] border border-[#334155] rounded-xl flex items-center justify-center text-[#94A3B8]"
            >
              {mobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex gap-1 pb-0 overflow-x-auto scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? `border-[#10B981] text-[#10B981]`
                    : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.key ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#334155] text-[#94A3B8]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

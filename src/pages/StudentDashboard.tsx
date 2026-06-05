import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Bookmark, Clock3, Archive, Bell, BarChart3, TrendingUp,
  CheckCheck, Eye, BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Category, Department, NoticeWithDetails } from '../lib/database.types';
import Header from '../components/Header';
import NoticeCard from '../components/NoticeCard';
import FilterSidebar from '../components/FilterSidebar';

type ActiveTab = 'feed' | 'bookmarks' | 'read-later' | 'archived' | 'subscriptions';

interface UserData {
  readIds: Set<string>;
  bookmarkIds: Set<string>;
  readLaterIds: Set<string>;
  archiveIds: Set<string>;
  subscriptionIds: Set<string>;
}

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<NoticeWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userData, setUserData] = useState<UserData>({
    readIds: new Set(), bookmarkIds: new Set(), readLaterIds: new Set(),
    archiveIds: new Set(), subscriptionIds: new Set(),
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!profile) return;
    setLoading(true);

    const [
      { data: noticesData },
      { data: readData },
      { data: bookmarkData },
      { data: readLaterData },
      { data: archiveData },
      { data: subsData },
      { data: catsData },
      { data: deptsData },
    ] = await Promise.all([
      supabase.from('notices')
        .select(`*, profiles(full_name, role), departments(name, code), categories(name, color, icon, image_url, emoji)`)
        .eq('is_published', true)
        .eq('is_archived', false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false }),
      supabase.from('read_logs').select('notice_id').eq('user_id', profile.id),
      supabase.from('bookmarks').select('notice_id').eq('user_id', profile.id),
      supabase.from('read_later').select('notice_id').eq('user_id', profile.id),
      supabase.from('student_archives').select('notice_id').eq('user_id', profile.id),
      supabase.from('subscriptions').select('category_id').eq('user_id', profile.id),
      supabase.from('categories').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
    ]);

    setNotices((noticesData as NoticeWithDetails[]) ?? []);
    setUserData({
      readIds: new Set(readData?.map(r => r.notice_id) ?? []),
      bookmarkIds: new Set(bookmarkData?.map(r => r.notice_id) ?? []),
      readLaterIds: new Set(readLaterData?.map(r => r.notice_id) ?? []),
      archiveIds: new Set(archiveData?.map(r => r.notice_id) ?? []),
      subscriptionIds: new Set(subsData?.map(r => r.category_id) ?? []),
    });
    if (catsData) setCategories(catsData);
    if (deptsData) setDepartments(deptsData);
    setLoading(false);
  }, [profile]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const markRead = async (noticeId: string) => {
    if (!profile || userData.readIds.has(noticeId)) return;

    let didRecord = false;

    const { data: rpcData, error: rpcError } = await supabase.rpc('record_view', { p_user: profile.id, p_notice: noticeId });
    if (rpcError) {
      console.warn('record_view RPC failed:', (rpcError as any).message ?? rpcError);
      const { error: insertError } = await supabase.from('read_logs').insert({ user_id: profile.id, notice_id: noticeId });
      if (!insertError) {
        didRecord = true;
      }
    } else {
      didRecord = rpcData != null;
    }

    if (didRecord) {
      setUserData(d => ({ ...d, readIds: new Set([...d.readIds, noticeId]) }));
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, view_count: (n.view_count ?? 0) + 1 } : n));
    }
  };

  const toggleBookmark = async (noticeId: string, add: boolean) => {
    if (!profile) return;
    if (add) {
      await supabase.from('bookmarks').insert({ user_id: profile.id, notice_id: noticeId });
      setUserData(d => ({ ...d, bookmarkIds: new Set([...d.bookmarkIds, noticeId]) }));
    } else {
      await supabase.from('bookmarks').delete().eq('user_id', profile.id).eq('notice_id', noticeId);
      setUserData(d => { const s = new Set(d.bookmarkIds); s.delete(noticeId); return { ...d, bookmarkIds: s }; });
    }
  };

  const toggleReadLater = async (noticeId: string, add: boolean) => {
    if (!profile) return;
    if (add) {
      await supabase.from('read_later').insert({ user_id: profile.id, notice_id: noticeId });
      setUserData(d => ({ ...d, readLaterIds: new Set([...d.readLaterIds, noticeId]) }));
    } else {
      await supabase.from('read_later').delete().eq('user_id', profile.id).eq('notice_id', noticeId);
      setUserData(d => { const s = new Set(d.readLaterIds); s.delete(noticeId); return { ...d, readLaterIds: s }; });
    }
  };

  const toggleArchive = async (noticeId: string, add: boolean) => {
    if (!profile) return;
    if (add) {
      await supabase.from('student_archives').insert({ user_id: profile.id, notice_id: noticeId });
      setUserData(d => ({ ...d, archiveIds: new Set([...d.archiveIds, noticeId]) }));
    } else {
      await supabase.from('student_archives').delete().eq('user_id', profile.id).eq('notice_id', noticeId);
      setUserData(d => { const s = new Set(d.archiveIds); s.delete(noticeId); return { ...d, archiveIds: s }; });
    }
  };

  const toggleSubscription = async (categoryId: string) => {
    if (!profile) return;
    if (userData.subscriptionIds.has(categoryId)) {
      await supabase.from('subscriptions').delete().eq('user_id', profile.id).eq('category_id', categoryId);
      setUserData(d => { const s = new Set(d.subscriptionIds); s.delete(categoryId); return { ...d, subscriptionIds: s }; });
    } else {
      await supabase.from('subscriptions').insert({ user_id: profile.id, category_id: categoryId });
      setUserData(d => ({ ...d, subscriptionIds: new Set([...d.subscriptionIds, categoryId]) }));
    }
  };

  const baseFiltered = notices.filter(n => {
    if (selectedCategory && n.category_id !== selectedCategory) return false;
    if (selectedDepartment && n.department_id !== selectedDepartment) return false;
    if (selectedPriority && n.priority !== selectedPriority) return false;
    if (n.target_years?.length && !n.target_years.includes(profile.year ?? 0)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const scoreNotice = (notice: NoticeWithDetails) => {
    let score = 0;
    const branch = profile.branch?.toLowerCase() ?? '';
    const departmentCode = notice.departments?.code?.toLowerCase() ?? '';

    if (profile.department_id && notice.department_id === profile.department_id) score += 30;
    if (branch && departmentCode && departmentCode.includes(branch)) score += 20;
    if (notice.target_years?.length) {
      if (profile.year && notice.target_years.includes(profile.year)) score += 30;
      else score -= 10;
    } else {
      score += 10;
    }

    if (notice.category_id && userData.subscriptionIds.has(notice.category_id)) score += 25;
    if (userData.bookmarkIds.has(notice.id)) score += 20;
    if (userData.readIds.has(notice.id)) score -= 10;

    if (notice.priority === 'urgent') score += 20;
    else if (notice.priority === 'high') score += 10;

    const ageHours = (Date.now() - new Date(notice.created_at).getTime()) / 3600000;
    if (ageHours < 6) score += 20;
    else if (ageHours < 24) score += 12;
    else if (ageHours < 72) score += 6;

    if (notice.expires_at) {
      const hoursUntil = (new Date(notice.expires_at).getTime() - Date.now()) / 3600000;
      if (hoursUntil >= 0 && hoursUntil <= 48) score += 15;
      else if (hoursUntil > 48 && hoursUntil <= 168) score += 6;
    }

    if (selectedCategory && notice.category_id === selectedCategory) score += 12;
    if (selectedDepartment && notice.department_id === selectedDepartment) score += 12;

    return score;
  };

  const sortNotices = (items: NoticeWithDetails[]) => {
    return [...items].sort((a, b) => scoreNotice(b) - scoreNotice(a));
  };

  const tabNotices: Record<ActiveTab, NoticeWithDetails[]> = {
    feed: sortNotices(baseFiltered),
    bookmarks: sortNotices(baseFiltered.filter(n => userData.bookmarkIds.has(n.id))),
    'read-later': sortNotices(baseFiltered.filter(n => userData.readLaterIds.has(n.id))),
    archived: sortNotices(baseFiltered.filter(n => userData.archiveIds.has(n.id))),
    subscriptions: sortNotices(baseFiltered.filter(n => n.category_id && userData.subscriptionIds.has(n.category_id))),
  };

  const unread = notices.filter(n => !userData.readIds.has(n.id)).length;

  const tabs = [
    { key: 'feed', label: 'All Notices', icon: <LayoutDashboard className="w-4 h-4" />, count: unread },
    { key: 'subscriptions', label: 'Subscribed', icon: <Bell className="w-4 h-4" />, count: tabNotices.subscriptions.length },
    { key: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" />, count: userData.bookmarkIds.size },
    { key: 'read-later', label: 'Read Later', icon: <Clock3 className="w-4 h-4" />, count: userData.readLaterIds.size },
    { key: 'archived', label: 'Archived', icon: <Archive className="w-4 h-4" />, count: userData.archiveIds.size },
  ];

  const currentNotices = tabNotices[activeTab];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={t => setActiveTab(t as ActiveTab)}
        tabs={tabs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<Bell className="w-5 h-5 text-[#10B981]" />} label="Total Notices" value={notices.length} bg="bg-[#10B981]/10 border-[#10B981]/20" />
          <StatCard icon={<Eye className="w-5 h-5 text-[#8B5CF6]" />} label="Unread" value={unread} bg="bg-[#8B5CF6]/10 border-[#8B5CF6]/20" />
          <StatCard icon={<Bookmark className="w-5 h-5 text-[#F59E0B]" />} label="Bookmarked" value={userData.bookmarkIds.size} bg="bg-[#F59E0B]/10 border-[#F59E0B]/20" />
          <StatCard icon={<CheckCheck className="w-5 h-5 text-[#10B981]" />} label="Subscriptions" value={userData.subscriptionIds.size} bg="bg-[#10B981]/10 border-[#10B981]/20" />
        </div>

        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="space-y-4 sticky top-24">
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl p-4">
                <FilterSidebar
                  categories={categories}
                  departments={departments}
                  selectedCategory={selectedCategory}
                  selectedDepartment={selectedDepartment}
                  selectedPriority={selectedPriority}
                  onCategoryChange={setSelectedCategory}
                  onDepartmentChange={setSelectedDepartment}
                  onPriorityChange={setSelectedPriority}
                />
              </div>

              {/* Subscribe to categories */}
              <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#10B981]" />
                  My Subscriptions
                </h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => toggleSubscription(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                        userData.subscriptionIds.has(c.id)
                          ? 'text-white bg-[#334155] border border-[#475569]'
                          : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#CBD5E1]'
                      }`}
                    >
                      <span className="text-sm">{c.emoji || '📌'}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      {userData.subscriptionIds.has(c.id) && (
                        <span className="w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCheck className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">
                {currentNotices.length} notice{currentNotices.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              <button
                onClick={() => setSidebarOpen(s => !s)}
                className="lg:hidden flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
              <div className="lg:hidden space-y-4 mb-4">
                <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl p-4">
                  <FilterSidebar
                    categories={categories}
                    departments={departments}
                    selectedCategory={selectedCategory}
                    selectedDepartment={selectedDepartment}
                    selectedPriority={selectedPriority}
                    onCategoryChange={setSelectedCategory}
                    onDepartmentChange={setSelectedDepartment}
                    onPriorityChange={setSelectedPriority}
                  />
                </div>
                <div className="bg-[#1E293B]/50 border border-[#334155] rounded-2xl p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#10B981]" />
                    My Subscriptions
                  </h3>
                  <div className="space-y-1">
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => toggleSubscription(c.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                          userData.subscriptionIds.has(c.id)
                            ? 'text-white bg-[#334155] border border-[#475569]'
                            : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#CBD5E1]'
                        }`}
                      >
                        <span className="text-sm">{c.emoji || '📌'}</span>
                        <span className="flex-1 truncate">{c.name}</span>
                        {userData.subscriptionIds.has(c.id) && (
                          <span className="w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCheck className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : currentNotices.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="space-y-3">
                {currentNotices.map(notice => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    role="student"
                    isRead={userData.readIds.has(notice.id)}
                    isBookmarked={userData.bookmarkIds.has(notice.id)}
                    isReadLater={userData.readLaterIds.has(notice.id)}
                    isArchived={userData.archiveIds.has(notice.id)}
                    onRead={markRead}
                    onBookmark={toggleBookmark}
                    onReadLater={toggleReadLater}
                    onArchive={toggleArchive}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className={`${bg} border rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#94A3B8] mt-0.5">{label}</p>
    </div>
  );
}

function EmptyState({ tab }: { tab: ActiveTab }) {
  const messages: Record<ActiveTab, { icon: React.ReactNode; title: string; sub: string }> = {
    feed: { icon: <TrendingUp className="w-12 h-12 text-[#475569] mx-auto mb-3" />, title: 'No notices yet', sub: 'New notices will appear here' },
    bookmarks: { icon: <Bookmark className="w-12 h-12 text-[#475569] mx-auto mb-3" />, title: 'No bookmarks', sub: 'Bookmark notices to access them quickly' },
    'read-later': { icon: <Clock3 className="w-12 h-12 text-[#475569] mx-auto mb-3" />, title: 'Read later is empty', sub: 'Save notices to read them when you have time' },
    archived: { icon: <Archive className="w-12 h-12 text-[#475569] mx-auto mb-3" />, title: 'No archived notices', sub: 'Archive notices you are done with' },
    subscriptions: { icon: <Bell className="w-12 h-12 text-[#475569] mx-auto mb-3" />, title: 'No subscribed notices', sub: 'Subscribe to categories from the sidebar' },
  };
  const m = messages[tab];
  return (
    <div className="text-center py-20">
      {m.icon}
      <p className="text-[#94A3B8] font-medium">{m.title}</p>
      <p className="text-[#64748B] text-sm mt-1">{m.sub}</p>
    </div>
  );
}

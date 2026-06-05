import { useState, useEffect, useCallback } from 'react';
import { Plus, LayoutDashboard, FileText, Archive, BarChart3, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Category, Department, NoticeWithDetails } from '../lib/database.types';
import Header from '../components/Header';
import NoticeCard from '../components/NoticeCard';
import NoticeForm from '../components/NoticeForm';
import FilterSidebar from '../components/FilterSidebar';

type ActiveTab = 'all' | 'published' | 'drafts' | 'expired';

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<NoticeWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editNotice, setEditNotice] = useState<NoticeWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchNotices = useCallback(async () => {
    if (!profile) return;
    setLoading(true);

    const nowIso = new Date().toISOString();
    const myNoticesPromise = supabase
      .from('notices')
      .select(`*, profiles(full_name, role), departments(name, code), categories(name, color, icon, image_url, emoji)`)
      .eq('author_id', profile.id);

    const publishedVisibleQuery = supabase
      .from('notices')
      .select(`*, profiles(full_name, role), departments(name, code), categories(name, color, icon, image_url, emoji)`)
      .eq('is_published', true)
      .eq('is_archived', false)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

    const publishedVisiblePromise = profile.department_id
      ? publishedVisibleQuery.or(`department_id.is.null,department_id.eq.${profile.department_id}`)
      : publishedVisibleQuery;

    const [{ data: myNotices }, { data: publishedNotices }] = await Promise.all([
      myNoticesPromise,
      publishedVisiblePromise,
    ]);

    const combined = [...(myNotices as NoticeWithDetails[] ?? []), ...(publishedNotices as NoticeWithDetails[] ?? [])];
    const uniqueNotices = Array.from(new Map(combined.map(n => [n.id, n])).values());
    uniqueNotices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotices(uniqueNotices);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchNotices();
    Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
    ]).then(([{ data: cats }, { data: depts }]) => {
      if (cats) setCategories(cats);
      if (depts) setDepartments(depts);
    });
  }, [fetchNotices]);

  const handleDelete = async (id: string) => {
    await supabase.from('notices').delete().eq('id', id);
    setDeleteId(null);
    fetchNotices();
  };

  const filtered = notices.filter(n => {
    const now = new Date();
    const expired = n.expires_at && new Date(n.expires_at) < now;

    if (activeTab === 'published' && (!n.is_published || expired)) return false;
    if (activeTab === 'drafts' && n.is_published) return false;
    if (activeTab === 'expired' && !expired) return false;

    if (selectedCategory && n.category_id !== selectedCategory) return false;
    if (selectedDepartment && n.department_id !== selectedDepartment) return false;
    if (selectedPriority && n.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: notices.length,
    published: notices.filter(n => n.is_published && !(n.expires_at && new Date(n.expires_at) < new Date())).length,
    drafts: notices.filter(n => !n.is_published).length,
    expired: notices.filter(n => n.expires_at && new Date(n.expires_at) < new Date()).length,
    urgent: notices.filter(n => n.priority === 'urgent' && n.is_published).length,
  };

  const tabs = [
    { key: 'all', label: 'All Notices', icon: <FileText className="w-4 h-4" />, count: stats.total },
    { key: 'published', label: 'Published', icon: <CheckCircle className="w-4 h-4" />, count: stats.published },
    { key: 'drafts', label: 'Drafts', icon: <Clock className="w-4 h-4" />, count: stats.drafts },
    { key: 'expired', label: 'Expired', icon: <Archive className="w-4 h-4" />, count: stats.expired },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={t => setActiveTab(t as ActiveTab)}
        tabs={tabs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<LayoutDashboard className="w-5 h-5 text-blue-400" />} label="Total Notices" value={stats.total} bg="bg-blue-500/10 border-blue-500/20" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} label="Published" value={stats.published} bg="bg-emerald-500/10 border-emerald-500/20" />
          <StatCard icon={<Clock className="w-5 h-5 text-amber-400" />} label="Drafts" value={stats.drafts} bg="bg-amber-500/10 border-amber-500/20" />
          <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-400" />} label="Urgent Active" value={stats.urgent} bg="bg-red-500/10 border-red-500/20" />
        </div>

        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 sticky top-24">
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
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">
                {filtered.length} notice{filtered.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(s => !s)}
                  className="lg:hidden flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Filters
                </button>
                <button
                  onClick={() => { setEditNotice(null); setShowForm(true); }}
                  className="flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 transition-colors shadow-lg shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  Post Notice
                </button>
              </div>
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
              <div className="lg:hidden bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-4">
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
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No notices found</p>
                <p className="text-slate-600 text-sm mt-1">Post your first notice to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(notice => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    role="teacher"
                    onEdit={notice.author_id === profile?.id ? n => { setEditNotice(n); setShowForm(true); } : undefined}
                    onDelete={notice.author_id === profile?.id ? id => setDeleteId(id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notice Form Modal */}
      {showForm && (
        <NoticeForm
          editNotice={editNotice}
          onClose={() => { setShowForm(false); setEditNotice(null); }}
          onSaved={fetchNotices}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-semibold text-center mb-2">Delete Notice</h3>
            <p className="text-slate-400 text-sm text-center mb-6">This action cannot be undone. The notice will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-medium shadow-lg shadow-red-600/30">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className={`${bg} border rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

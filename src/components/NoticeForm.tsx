import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Category, Department, NoticeWithDetails } from '../lib/database.types';

interface NoticeFormProps {
  editNotice?: NoticeWithDetails | null;
  onClose: () => void;
  onSaved: () => void;
}

type TeacherKeyRecord = {
  id: string;
  key: string;
  name: string;
  department_id: string | null;
};

export default function NoticeForm({ editNotice, onClose, onSaved }: NoticeFormProps) {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teacherKey, setTeacherKey] = useState<TeacherKeyRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: editNotice?.title ?? '',
    content: editNotice?.content ?? '',
    category_id: editNotice?.category_id ?? '',
    department_id: editNotice?.department_id ?? profile?.department_id ?? '',
    target_years: editNotice?.target_years?.map(String) ?? [],
    priority: editNotice?.priority ?? 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    is_published: editNotice?.is_published ?? true,
    expires_at: editNotice?.expires_at ? editNotice.expires_at.slice(0, 10) : '',
  });

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
    ]).then(([{ data: cats }, { data: depts }]) => {
      if (cats) setCategories(cats);
      if (depts) setDepartments(depts);
    });
  }, []);

  useEffect(() => {
    if (!profile || profile.role !== 'teacher') return;

    supabase
      .from('teacher_keys')
      .select('id,key,name,department_id')
      .eq('used_by', profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setTeacherKey(data as TeacherKeyRecord);
      });
  }, [profile]);

  const clubCategory = useMemo(
    () => categories.find(c => c.name.toLowerCase().includes('club')),
    [categories],
  );

  const isAdminTeacher = useMemo(
    () => Boolean(teacherKey && (teacherKey.key === 'TEACHER-ADMIN-1760' || teacherKey.name.toLowerCase().includes('admin'))),
    [teacherKey],
  );

  const isClubCoordinator = useMemo(
    () => Boolean(teacherKey && teacherKey.name.toLowerCase().includes('club')),
    [teacherKey],
  );

  const departmentTeacherId = useMemo(
    () => teacherKey?.department_id ?? profile?.department_id ?? null,
    [teacherKey, profile],
  );

  const allowedCategories = useMemo(() => {
    if (isClubCoordinator) {
      return clubCategory ? [clubCategory] : [];
    }
    return categories;
  }, [categories, clubCategory, isClubCoordinator]);

  const allowedDepartments = useMemo(() => {
    if (isAdminTeacher || isClubCoordinator) return departments;
    if (!departmentTeacherId) return departments;
    return departments.filter(d => d.id === departmentTeacherId);
  }, [departments, departmentTeacherId, isAdminTeacher, isClubCoordinator]);

  const permissionInfo = useMemo(() => {
    if (!profile || profile.role !== 'teacher') return '';
    if (isAdminTeacher) return 'Admin teachers can post notices for any department.';
    if (isClubCoordinator) return 'Club Coordinator notices are limited to the Clubs & Societies category.';
    if (departmentTeacherId) {
      const departmentName = departments.find(d => d.id === departmentTeacherId)?.name ?? 'your department';
      return `Your teacher key is limited to ${departmentName} notices only.`;
    }
    return 'Your teacher key limits your posting permissions by department.';
  }, [profile, isAdminTeacher, isClubCoordinator, departmentTeacherId, departments]);

  useEffect(() => {
    if (allowedDepartments.length === 1 && !form.department_id) {
      setForm(f => ({ ...f, department_id: allowedDepartments[0].id }));
    }
  }, [allowedDepartments, form.department_id]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleTargetYear = (year: string) => {
    setForm(f => {
      const selected = new Set(f.target_years);
      if (selected.has(year)) {
        selected.delete(year);
      } else {
        selected.add(year);
      }
      return { ...f, target_years: Array.from(selected).sort() };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError('');
    setLoading(true);

    if (!allowedCategories.find(c => c.id === form.category_id)) {
      setError('Your teacher role does not allow this category.');
      setLoading(false);
      return;
    }

    if (!isAdminTeacher && !isClubCoordinator && departmentTeacherId && form.department_id !== departmentTeacherId) {
      setError('Your teacher role only permits posting to your assigned department.');
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      content: form.content,
      category_id: form.category_id || null,
      department_id: form.department_id || (isClubCoordinator ? null : departmentTeacherId),
      target_years: form.target_years.length ? form.target_years.map(Number) : null,
      priority: form.priority,
      is_published: form.is_published,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (editNotice) {
      ({ error: err } = await supabase.from('notices').update(payload).eq('id', editNotice.id));
    } else {
      ({ error: err } = await supabase.from('notices').insert({ ...payload, author_id: profile.id }));
    }

    setLoading(false);
    if (err) { setError(err.message); return; }
    onSaved();
    onClose();
  };

  const inputClass = "w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">
            {editNotice ? 'Edit Notice' : 'Post New Notice'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Title *</label>
            <input type="text" required value={form.title} onChange={set('title')} placeholder="Notice title" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Content *</label>
            <textarea
              required
              value={form.content}
              onChange={set('content')}
              placeholder="Write the notice details..."
              rows={5}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Category</label>
              <select value={form.category_id} onChange={set('category_id')} className={inputClass}>
                <option value="">Select category</option>
                {allowedCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Department</label>
              <select
                value={form.department_id}
                onChange={set('department_id')}
                className={inputClass}
                disabled={!isAdminTeacher && !isClubCoordinator && allowedDepartments.length === 1}
              >
                <option value="">All Departments</option>
                {allowedDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm text-slate-400 mb-1.5">Visible To</label>
              <div className="grid grid-cols-2 gap-2">
                {['1', '2', '3', '4'].map(year => (
                  <label key={year} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer hover:border-blue-500">
                    <input
                      type="checkbox"
                      checked={form.target_years.includes(year)}
                      onChange={() => toggleTargetYear(year)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                    />
                    Year {year}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Leave all years unchecked to publish to all years.</p>
            </div>
          </div>

          {permissionInfo && (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              {permissionInfo}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Priority</label>
              <select value={form.priority} onChange={set('priority')} className={inputClass}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Expires On</label>
              <input type="date" value={form.expires_at} onChange={set('expires_at')} min={new Date().toISOString().slice(0, 10)} className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
              className={`relative w-10 h-5 rounded-full transition-all ${form.is_published ? 'bg-blue-500' : 'bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="text-sm text-slate-300">
              {form.is_published ? 'Published (visible to students)' : 'Draft (hidden)'}
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-semibold shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editNotice ? 'Save Changes' : 'Post Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

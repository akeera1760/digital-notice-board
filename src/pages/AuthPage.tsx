import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Eye, EyeOff, ArrowRight, Bell, Users, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Department } from '../lib/database.types';

type Mode = 'login' | 'register';
type Tab = 'student' | 'teacher';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [tab, setTab] = useState<Tab>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showTeacherKey, setShowTeacherKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    department_id: '',
    year: '',
    teacherKey: '',
    teacherRole: '',
  });

  type TeacherRoleOption = {
    value: string;
    label: string;
    departmentCode: string | null;
  };

  const teacherRoles: TeacherRoleOption[] = [
    { value: 'CSE_HOD', label: 'Computer Science & Engineering HOD', departmentCode: 'CSE' },
    { value: 'CSE_CORE_HOD', label: 'CSE_CORE HOD', departmentCode: 'CORE' },
    { value: 'ECE_HOD', label: 'Electrical & Communication HOD', departmentCode: 'ECE' },
    { value: 'IT_HOD', label: 'Information Technology HOD', departmentCode: 'IT' },
    { value: 'CE_HOD', label: 'Civil Engineering HOD', departmentCode: 'CE' },
    { value: 'EE_HOD', label: 'Electrical Engineering HOD', departmentCode: 'EE' },
    { value: 'OTHER', label: 'Other', departmentCode: null },
    { value: 'ADMIN', label: 'Admin', departmentCode: null },
  ];

  useEffect(() => {
    supabase
      .from('departments')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setDepartments(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password);
      if (error) setError(error);
    } else {
      if (tab === 'teacher') {
        if (!form.teacherRole) {
          setError('Please select your teacher role');
          setLoading(false);
          return;
        }

        if (!form.teacherKey.trim()) {
          setError('Teacher registration key is required');
          setLoading(false);
          return;
        }

        const selectedRole = teacherRoles.find(role => role.value === form.teacherRole);
        if (!selectedRole) {
          setError('Selected teacher role is invalid');
          setLoading(false);
          return;
        }

        const teacherDepartment = selectedRole.departmentCode
          ? departments.find(d => d.code === selectedRole.departmentCode)?.id
          : null;

        type TeacherKeyRecord = {
          id: string;
          key: string;
          name: string;
          department_id: string | null;
          used_by: string | null;
          is_active: boolean;
        };

        const keyResp = await (supabase
          .from('teacher_keys')
          .select('*')
          .eq('key', form.teacherKey.trim())
          .eq('is_active', true)
          .maybeSingle()) as { data: TeacherKeyRecord | null; error: any };

        const keyData = keyResp.data;
        const keyError = keyResp.error;

        if (keyError || !keyData) {
          setError('Invalid or inactive teacher registration key');
          setLoading(false);
          return;
        }

        if (keyData.used_by) {
          setError('This teacher key has already been used');
          setLoading(false);
          return;
        }

        if (keyData.name !== selectedRole.label) {
          setError('Teacher key does not match the selected role');
          setLoading(false);
          return;
        }

        if (selectedRole.departmentCode && keyData.department_id !== teacherDepartment) {
          setError('Teacher key department does not match the selected role');
          setLoading(false);
          return;
        }
      }

      const selectedRole = teacherRoles.find(role => role.value === form.teacherRole);
      const teacherDepartment = selectedRole?.departmentCode
        ? departments.find(d => d.code === selectedRole.departmentCode)?.id
        : null;

      const { error } = await signUp(form.email, form.password, {
        full_name: form.full_name,
        role: tab,
        department_id: tab === 'student' ? form.department_id || undefined : teacherDepartment || undefined,
        year: tab === 'student' ? (form.year ? Number(form.year) : undefined) : undefined,
        teacherKey: tab === 'teacher' ? form.teacherKey : undefined,
        teacherRole: tab === 'teacher' ? form.teacherRole : undefined,
      } as any);
      if (error) setError(error);
    }
    setLoading(false);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/20 to-[#8B5CF6]/10" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#8B5CF6]/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-emerald-violet rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Digital Notice Board</h1>
              <p className="text-[#10B981] text-sm">Campus Communication Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Never miss a<br />
            <span className="gradient-text text-4xl font-bold">
              campus announcement
            </span>
          </h2>
          <p className="text-[#94A3B8] text-lg mb-10 leading-relaxed">
            A smart digital notice board replacing physical boards. Stay connected with your department and college.
          </p>

          <div className="space-y-4">
            {[
              { icon: BookOpen, label: 'Department notices & circulars', color: 'text-[#10B981]' },
              { icon: Bell, label: 'Real-time notifications', color: 'text-[#F59E0B]' },
              { icon: Users, label: 'Category subscriptions', color: 'text-[#8B5CF6]' },
              { icon: Shield, label: 'Role-based access control', color: 'text-[#10B981]' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1E293B] rounded-lg flex items-center justify-center border border-[#334155]">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-[#CBD5E1] text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-emerald-violet rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-white font-bold text-lg">Digital Notice Board</h1>
          </div>

          <div className="card-premium p-8">
            {/* Mode toggle */}
            <div className="flex bg-[#0F172A]/60 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-gradient-emerald-violet text-white shadow-lg shadow-emerald-500/30' : 'text-[#94A3B8] hover:text-[#CBD5E1]'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-gradient-emerald-violet text-white shadow-lg shadow-emerald-500/30' : 'text-[#94A3B8] hover:text-[#CBD5E1]'}`}
              >
                Register
              </button>
            </div>

            {/* Role tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setTab('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${tab === 'student' ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]' : 'border-[#334155] text-[#94A3B8] hover:border-[#475569]'}`}
              >
                <GraduationCap className="w-4 h-4" />
                Student
              </button>
              <button
                onClick={() => setTab('teacher')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${tab === 'teacher' ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]' : 'border-[#334155] text-[#94A3B8] hover:border-[#475569]'}`}
              >
                <BookOpen className="w-4 h-4" />
                Teacher
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={set('full_name')}
                      placeholder="Enter your full name"
                      className="input-premium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-[#94A3B8] mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@college.edu"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    className="input-premium pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#CBD5E1] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  {tab === 'teacher' && (
                    <>
                      <div>
                        <label className="block text-sm text-[#94A3B8] mb-1.5">
                          Teacher Role
                          <span className="text-[#F59E0B] ml-1">*</span>
                        </label>
                        <select
                          required
                          value={form.teacherRole}
                          onChange={set('teacherRole')}
                          className="input-premium"
                        >
                          <option value="">Select your teacher role</option>
                          {teacherRoles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                        <p className="text-xs text-[#64748B] mt-1.5">
                          Choose the role that matches your teacher registration key.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm text-[#94A3B8] mb-1.5">
                          Teacher Registration Key
                          <span className="text-[#F59E0B] ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showTeacherKey ? 'text' : 'password'}
                            required
                            value={form.teacherKey}
                            onChange={set('teacherKey')}
                            placeholder="Enter your institutional teacher key"
                            className="input-premium uppercase pr-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowTeacherKey(v => !v)}
                            className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-white"
                          >
                            {showTeacherKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-[#64748B] mt-1.5">
                          This unique key is provided by your institution. Contact the admin if you don't have one.
                        </p>
                      </div>
                    </>
                  )}

                  {tab === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm text-[#94A3B8] mb-1.5">Department</label>
                        <select
                          value={form.department_id}
                          onChange={set('department_id')}
                          className="input-premium appearance-none"
                        >
                          <option value="">Select department</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-[#94A3B8] mb-1.5">Year</label>
                        <select
                          value={form.year}
                          onChange={set('year')}
                          className="input-premium appearance-none"
                        >
                          <option value="">Select year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-[#EF4444] text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                  tab === 'teacher'
                    ? 'bg-gradient-amber-orange hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] text-slate-900 shadow-amber-500/30'
                    : 'bg-gradient-emerald-violet hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white shadow-emerald-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[#64748B] text-xs mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-[#10B981] hover:text-[#6EE7B7] transition-colors font-medium"
              >
                {mode === 'login' ? 'Register here' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

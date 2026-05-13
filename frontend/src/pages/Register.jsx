import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.displayName);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--gold)' }}>SARFOWAA</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#C9A84C]/15 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: 'displayName', label: 'Full Name', type: 'text', placeholder: 'Ama Sarfowaa' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-gray-400 text-sm mb-1.5">{f.label}</label>
                <input type={f.type} required value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A84C]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Confirm Password</label>
              <input type="password" required value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C9A84C] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

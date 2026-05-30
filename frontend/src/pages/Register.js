import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[!@#$%]/.test(p)) s++;
    return s;
  })();

  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="hero-icon">🚀</div>
          <h1>Start Tracking</h1>
          <p>Join thousands of smart spenders managing their finances with ExpenseTracker.</p>
          <div className="steps">
            {['Create your account', 'Add your expenses', 'Analyze & save more'].map((s, i) => (
              <div key={s} className="step">
                <div className="step-num">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create account</h2>
            <p>Start your financial journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" placeholder="Pranav Sharma"
                value={form.name} onChange={handleChange} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} required />
              {form.password && (
                <div className="strength-bar">
                  <div className="strength-track">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="strength-seg" style={{ background: i <= strength ? strengthColors[strength] : '#1f2d4a' }} />
                    ))}
                  </div>
                  <span style={{ color: strengthColors[strength], fontSize: '11px' }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="confirm" className="form-input" placeholder="Repeat password"
                value={form.confirm} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { display: flex; min-height: 100vh; }
        .auth-left {
          flex: 1; background: linear-gradient(135deg, #0d1120, #111827);
          display: flex; align-items: center; justify-content: center; padding: 60px;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.08) 0%, transparent 60%);
        }
        .auth-hero { position: relative; max-width: 380px; }
        .hero-icon { font-size: 52px; margin-bottom: 20px; }
        .auth-hero h1 { font-size: 40px; font-weight: 800; color: #f1f5f9; margin-bottom: 12px; }
        .auth-hero p { font-size: 15px; color: #64748b; margin-bottom: 36px; line-height: 1.7; }
        .steps { display: flex; flex-direction: column; gap: 16px; }
        .step { display: flex; align-items: center; gap: 14px; }
        .step-num {
          width: 32px; height: 32px; border-radius: 50%; background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.3); display: flex; align-items: center;
          justify-content: center; font-size: 13px; font-weight: 700; color: #8b5cf6; flex-shrink: 0;
        }
        .step span { font-size: 14px; color: #94a3b8; }
        .auth-right {
          width: 480px; display: flex; align-items: center; justify-content: center;
          padding: 40px; background: #0a0e1a;
        }
        .auth-card { width: 100%; max-width: 400px; }
        .auth-header { margin-bottom: 28px; }
        .auth-header h2 { font-size: 28px; font-weight: 800; color: #f1f5f9; }
        .auth-header p { font-size: 14px; color: #64748b; margin-top: 4px; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }
        .strength-bar { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
        .strength-track { display: flex; gap: 4px; flex: 1; }
        .strength-seg { flex: 1; height: 3px; border-radius: 2px; transition: background 0.3s; }
        .auth-link { text-align: center; font-size: 13px; color: #64748b; margin-top: 4px; }
        .auth-link a { color: #3b82f6; text-decoration: none; font-weight: 600; }
        @media (max-width: 900px) { .auth-left { display: none; } .auth-right { width: 100%; } }
      `}</style>
    </div>
  );
};

export default Register;

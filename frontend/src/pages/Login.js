import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'frontend/src/context/AuthContext.js';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="hero-icon">💸</div>
          <h1>ExpenseTracker</h1>
          <p>Track every rupee. Save smarter. Live better.</p>
          <div className="hero-features">
            {['📊 Visual spending insights', '🏷️ Category management', '📅 Monthly summaries', '🔒 Secure & private'].map(f => (
              <div key={f} className="hero-feature">{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Sign in</h2>
            <p>Access your expense dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" name="email" className="form-input"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} name="password" className="form-input"
                  placeholder="Enter your password"
                  value={form.password} onChange={handleChange} required
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>Demo Credentials</span></div>
          <div className="demo-creds">
            <code>demo@expense.com / Demo1234</code>
          </div>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create account →</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { display: flex; min-height: 100vh; }
        .auth-left {
          flex: 1; background: linear-gradient(135deg, #0d1120 0%, #111827 50%, #0f172a 100%);
          display: flex; align-items: center; justify-content: center; padding: 60px;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 70% 20%, rgba(139,92,246,0.06) 0%, transparent 50%);
        }
        .auth-hero { position: relative; max-width: 400px; }
        .hero-icon { font-size: 56px; margin-bottom: 20px; }
        .auth-hero h1 { font-size: 42px; font-weight: 800; color: #f1f5f9; margin-bottom: 12px; }
        .auth-hero p { font-size: 16px; color: #64748b; margin-bottom: 36px; }
        .hero-features { display: flex; flex-direction: column; gap: 12px; }
        .hero-feature {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; background: rgba(255,255,255,0.03);
          border: 1px solid #1f2d4a; border-radius: 10px;
          font-size: 14px; color: #94a3b8;
        }
        .auth-right {
          width: 480px; display: flex; align-items: center; justify-content: center;
          padding: 40px; background: #0a0e1a;
        }
        .auth-card { width: 100%; max-width: 400px; }
        .auth-header { margin-bottom: 32px; }
        .auth-header h2 { font-size: 30px; font-weight: 800; color: #f1f5f9; }
        .auth-header p { font-size: 14px; color: #64748b; margin-top: 4px; }
        .auth-form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
        .pass-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 16px; padding: 0;
        }
        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0; color: #475569; font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: #1f2d4a;
        }
        .demo-creds {
          background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15);
          border-radius: 8px; padding: 10px 14px; margin-bottom: 20px;
          font-size: 13px; color: #94a3b8; text-align: center;
        }
        .demo-creds code { color: #3b82f6; font-family: 'JetBrains Mono', monospace; }
        .auth-link { text-align: center; font-size: 13px; color: #64748b; }
        .auth-link a { color: #3b82f6; text-decoration: none; font-weight: 600; }
        @media (max-width: 900px) { .auth-left { display: none; } .auth-right { width: 100%; } }
      `}</style>
    </div>
  );
};

export default Login;

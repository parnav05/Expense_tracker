import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { expenseAPI } from '../../services/api';
import { useAuth } from 'frontend/src/context/AuthContext.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, monthRes] = await Promise.all([
          expenseAPI.getDashboard(),
          expenseAPI.getMonthlySummary(new Date().getFullYear()),
        ]);
        setStats(dashRes.data.data);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const raw = monthRes.data.data.summary;
        const filled = months.map((name, i) => {
          const found = raw.find((r) => parseInt(r.month) === i + 1);
          return { name, expense: parseFloat(found?.total_expense || 0), income: parseFloat(found?.total_income || 0) };
        });
        setMonthly(filled);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px', color: '#3b82f6' }} />
    </div>
  );

  const { current_month, recent_expenses = [], category_breakdown = [] } = stats || {};

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>
            ＋ Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Month Expenses', value: formatINR(current_month?.total_expense), icon: '📉', color: 'red', sub: 'This month' },
          { label: 'Month Income', value: formatINR(current_month?.total_income), icon: '📈', color: 'green', sub: 'This month' },
          { label: 'Net Balance', value: formatINR(current_month?.balance), icon: '⚖️', color: current_month?.balance >= 0 ? 'green' : 'red', sub: 'Income - Expenses' },
          { label: 'Transactions', value: recent_expenses.length, icon: '🔢', color: 'blue', sub: 'Recent entries' },
        ].map(({ label, value, icon, color, sub }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</p>
                <p style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{sub}</p>
              </div>
              <span style={{ fontSize: '28px', opacity: 0.7 }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Monthly Chart */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#f1f5f9' }}>
            Spending Overview — {new Date().getFullYear()}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#161d2e', border: '1px solid #1f2d4a', borderRadius: '10px', color: '#f1f5f9' }}
                formatter={(v, n) => [formatINR(v), n === 'expense' ? 'Expenses' : 'Income']}
              />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#f1f5f9' }}>
            Top Categories
          </h3>
          {category_breakdown.length > 0 ? (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={category_breakdown} dataKey="total" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {category_breakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.category?.color || '#6366f1'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {category_breakdown.slice(0, 5).map((item) => (
                  <div key={item.category_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.category?.color }} />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.category?.icon} {item.category?.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatINR(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="icon">🏷️</span>
              <p>No category data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>Recent Transactions</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/expenses')}>View All →</button>
        </div>
        {recent_expenses.length > 0 ? (
          <table className="expense-table">
            <thead><tr>
              <th>Title</th><th>Category</th><th>Date</th><th>Method</th><th style={{ textAlign: 'right' }}>Amount</th>
            </tr></thead>
            <tbody>
              {recent_expenses.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{e.title}</td>
                  <td><span style={{ fontSize: '12px' }}>{e.category?.icon} {e.category?.name}</span></td>
                  <td>{format(new Date(e.date), 'MMM d, yyyy')}</td>
                  <td><span className="badge" style={{ background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid #1f2d4a' }}>{e.payment_method}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={e.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {e.type === 'income' ? '+' : '-'}{formatINR(e.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <span className="icon">💸</span>
            <h3>No expenses yet</h3>
            <p>Add your first expense to get started</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/add-expense')}>Add Expense</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

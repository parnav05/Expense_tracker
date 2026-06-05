import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { expenseAPI } from '../services/api';
import toast from 'react-hot-toast';

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Summary = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthly, setMonthly] = useState([]);
  const [catSummary, setCatSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mRes, cRes] = await Promise.all([
          expenseAPI.getMonthlySummary(year),
          expenseAPI.getCategorySummary({ month, year }),
        ]);
        const raw = mRes.data.data.summary;
        const filled = months.map((name, i) => {
          const found = raw.find((r) => parseInt(r.month) === i + 1);
          return {
            name: name.slice(0, 3),
            expense: parseFloat(found?.total_expense || 0),
            income: parseFloat(found?.total_income || 0),
            count: parseInt(found?.count || 0),
          };
        });
        setMonthly(filled);
        setCatSummary(cRes.data.data.summary);
      } catch { toast.error('Failed to load summary'); }
      finally { setLoading(false); }
    };
    load();
  }, [year, month]);

  const yearTotals = monthly.reduce((acc, m) => ({
    expense: acc.expense + m.expense, income: acc.income + m.income
  }), { expense: 0, income: 0 });

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📊 Monthly Summary</h1>
            <p className="page-subtitle">Analyze your spending patterns</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select className="form-input" style={{ width: '110px' }} value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Year Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: `${year} Expenses`, value: formatINR(yearTotals.expense), icon: '📉', color: 'red' },
          { label: `${year} Income`, value: formatINR(yearTotals.income), icon: '📈', color: 'green' },
          { label: 'Net Savings', value: formatINR(yearTotals.income - yearTotals.expense), icon: '💰', color: yearTotals.income - yearTotals.expense >= 0 ? 'green' : 'red' },
          { label: 'Avg Monthly', value: formatINR(yearTotals.expense / 12), icon: '📅', color: 'blue' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
              </div>
              <span style={{ fontSize: '24px', opacity: 0.7 }}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#f1f5f9' }}>Monthly Breakdown — {year}</h3>
        {loading ? <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#161d2e', border: '1px solid #1f2d4a', borderRadius: '10px', color: '#f1f5f9' }}
                formatter={(v, n) => [formatINR(v), n === 'expense' ? 'Expenses' : 'Income']}
              />
              <Legend formatter={(v) => v === 'expense' ? 'Expenses' : 'Income'} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>Category Breakdown</h3>
          <select className="form-input" style={{ width: '140px' }} value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        {catSummary.length > 0 ? (
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={catSummary} dataKey="total" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
                  {catSummary.map((entry, i) => (
                    <Cell key={i} fill={entry.category?.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: '#161d2e', border: '1px solid #1f2d4a', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {catSummary.map((item) => {
                const total = catSummary.reduce((s, i) => s + parseFloat(i.total), 0);
                const pct = total ? ((parseFloat(item.total) / total) * 100).toFixed(1) : 0;
                return (
                  <div key={item.category_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.category?.icon} {item.category?.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatINR(item.total)} <span style={{ color: '#475569', fontSize: '11px' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: '4px', background: '#1f2d4a', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: item.category?.color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <span className="icon">📊</span>
            <h3>No data for {months[month - 1]} {year}</h3>
            <p>Add expenses to see category breakdown</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;

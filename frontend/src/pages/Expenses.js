import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from 'frontend/src/services/api.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({ search: '', month: '', year: new Date().getFullYear(), type: '', page: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 15 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.data.expenses);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeleting(id);
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted');
      load();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📋 Expenses</h1>
            <p className="page-subtitle">{pagination.total} total transactions</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>＋ Add Expense</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" style={{ flex: '1', minWidth: '180px' }} placeholder="🔍 Search..."
            value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          <select className="form-input" style={{ width: '130px' }} value={filters.month} onChange={(e) => setFilter('month', e.target.value)}>
            <option value="">All Months</option>
            {months.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-input" style={{ width: '100px' }} value={filters.year} onChange={(e) => setFilter('year', e.target.value)}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="form-input" style={{ width: '120px' }} value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ search: '', month: '', year: new Date().getFullYear(), type: '', page: 1 })}>
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', color: '#3b82f6', margin: '0 auto' }} />
          </div>
        ) : expenses.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="expense-table">
                <thead><tr>
                  <th>Title</th><th>Category</th><th>Date</th><th>Method</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'center' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td style={{ color: '#f1f5f9', fontWeight: 500 }}>
                        <div>{e.title}</div>
                        {e.description && <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{e.description}</div>}
                      </td>
                      <td><span>{e.category?.icon} {e.category?.name}</span></td>
                      <td>{format(new Date(e.date), 'MMM d, yyyy')}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid #1f2d4a', textTransform: 'capitalize' }}>
                          {e.payment_method}
                        </span>
                      </td>
                      <td><span className={`badge badge-${e.type}`}>{e.type}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={e.type === 'income' ? 'amount-income' : 'amount-expense'}>
                          {e.type === 'income' ? '+' : '-'}{formatINR(e.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/expenses/edit/${e.id}`)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)} disabled={deleting === e.id}>
                            {deleting === e.id ? <span className="spinner" /> : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '20px', borderTop: '1px solid #1f2d4a' }}>
                <button className="btn btn-secondary btn-sm" disabled={filters.page === 1} onClick={() => setFilter('page', filters.page - 1)}>← Prev</button>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Page {filters.page} of {pagination.pages}</span>
                <button className="btn btn-secondary btn-sm" disabled={filters.page >= pagination.pages} onClick={() => setFilter('page', filters.page + 1)}>Next →</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <span className="icon">🔍</span>
            <h3>No expenses found</h3>
            <p>Try adjusting your filters or add a new expense</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/add-expense')}>Add Expense</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expenseAPI, categoryAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', amount: '', description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense', payment_method: 'cash', category_id: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await categoryAPI.getAll();
        setCategories(catRes.data.data.categories);
        if (isEdit) {
          const expRes = await expenseAPI.getOne(id);
          const e = expRes.data.data.expense;
          setForm({
            title: e.title, amount: e.amount, description: e.description || '',
            date: e.date, type: e.type, payment_method: e.payment_method, category_id: e.category_id,
          });
        }
      } catch { toast.error('Failed to load data'); }
      finally { setFetching(false); }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id) { toast.error('Please select a category'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await expenseAPI.update(id, form);
        toast.success('Expense updated! ✅');
      } else {
        await expenseAPI.create(form);
        toast.success('Expense added! 💸');
      }
      navigate('/expenses');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length) errors.forEach((e) => toast.error(e.message));
      else toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? '✏️ Edit Expense' : '➕ Add Expense'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update transaction details' : 'Record a new transaction'}</p>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <div className="card">
          {/* Type Toggle */}
          <div className="type-toggle" style={{ marginBottom: '28px' }}>
            {['expense', 'income'].map((t) => (
              <button
                key={t} type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`type-btn ${form.type === t ? `active-${t}` : ''}`}
              >
                {t === 'expense' ? '📉 Expense' : '📈 Income'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input name="title" className="form-input" placeholder="e.g. Lunch at Subway" value={form.title} onChange={handleChange} required maxLength={200} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input name="amount" type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00" value={form.amount} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input name="date" type="date" className="form-input" value={form.date} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category_id" className="form-input" value={form.category_id} onChange={handleChange} required>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select name="payment_method" className="form-input" value={form.payment_method} onChange={handleChange}>
                    {['cash', 'card', 'upi', 'netbanking', 'other'].map((m) => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea name="description" className="form-input" placeholder="Any additional notes..." value={form.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/expenses')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Saving...</> : isEdit ? 'Update' : '+ Add Expense'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .type-toggle { display: flex; gap: 8px; background: #0d1120; padding: 4px; border-radius: 10px; border: 1px solid #1f2d4a; }
        .type-btn {
          flex: 1; padding: 10px; border: none; border-radius: 8px; background: transparent;
          color: #475569; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .type-btn:hover { color: #94a3b8; }
        .type-btn.active-expense { background: rgba(239,68,68,0.15); color: #ef4444; }
        .type-btn.active-income { background: rgba(16,185,129,0.15); color: #10b981; }
      `}</style>
    </div>
  );
};

export default AddExpense;

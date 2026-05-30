import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '📦', color: '#6366f1' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data.categories);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await categoryAPI.update(editing, form);
        toast.success('Category updated!');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created!');
      }
      setShowForm(false); setEditing(null); setForm({ name: '', icon: '📦', color: '#6366f1' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete');
    }
  };

  const EMOJI_PRESETS = ['🍽️','🚗','🛍️','🎬','💊','💡','📚','💰','📦','✈️','🏠','👕','🎮','☕','🏋️','🐾'];
  const COLOR_PRESETS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6b7280'];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">🏷️ Categories</h1>
            <p className="page-subtitle">{categories.length} categories</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', icon: '📦', color: '#6366f1' }); }}>
            ＋ New Category
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', maxWidth: '480px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#f1f5f9' }}>
            {editing ? 'Edit Category' : 'New Category'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" placeholder="e.g. Groceries" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {EMOJI_PRESETS.map((emoji) => (
                    <button key={emoji} type="button"
                      style={{ width: '36px', height: '36px', border: `2px solid ${form.icon === emoji ? '#3b82f6' : '#1f2d4a'}`, borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}
                      onClick={() => setForm({ ...form, icon: emoji })}>{emoji}
                    </button>
                  ))}
                </div>
                <input className="form-input" placeholder="or type emoji" value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })} style={{ width: '80px' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COLOR_PRESETS.map((c) => (
                    <button key={c} type="button"
                      style={{ width: '28px', height: '28px', borderRadius: '6px', background: c, border: form.color === c ? '3px solid #f1f5f9' : '2px solid transparent', cursor: 'pointer' }}
                      onClick={() => setForm({ ...form, color: c })} />
                  ))}
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                    style={{ width: '28px', height: '28px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '0' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {categories.map((cat) => (
          <div key={cat.id} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: cat.color + '22', border: `1px solid ${cat.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                {cat.icon}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '14px' }}>{cat.name}</p>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, marginTop: '4px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleEdit(cat)}>✏️ Edit</button>
              {!cat.is_default && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;

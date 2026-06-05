import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

const navItems = [
  { path: '/dashboard', icon: '◉', label: 'Dashboard' },
  { path: '/expenses', icon: '📋', label: 'Expenses' },
  { path: '/add-expense', icon: '＋', label: 'Add Expense' },
  { path: '/summary', icon: '📊', label: 'Monthly Summary' },
  { path: '/categories', icon: '🏷️', label: 'Categories' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar" style={{ width: collapsed ? '70px' : '260px' }}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="brand-icon">💸</span>
            <span className="brand-text">ExpenseTracker</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : ''}
          >
            <span className="nav-icon">{icon}</span>
            {!collapsed && <span className="nav-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <style>{`
        .sidebar {
          position: fixed; top: 0; left: 0; height: 100vh;
          background: #0d1120;
          border-right: 1px solid #1f2d4a;
          display: flex; flex-direction: column;
          z-index: 100; transition: width 0.25s ease;
          overflow: hidden;
        }
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 16px; border-bottom: 1px solid #1f2d4a; min-height: 68px;
        }
        .sidebar-brand { display: flex; align-items: center; gap: 10px; }
        .brand-icon { font-size: 22px; }
        .brand-text { font-size: 16px; font-weight: 800; color: #f1f5f9; white-space: nowrap; }
        .collapse-btn {
          background: transparent; border: 1px solid #1f2d4a; color: #475569;
          width: 28px; height: 28px; border-radius: 6px; cursor: pointer;
          font-size: 10px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .collapse-btn:hover { border-color: #3b82f6; color: #3b82f6; }
        .sidebar-nav { flex: 1; padding: 16px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 11px 12px;
          border-radius: 10px; text-decoration: none; color: #94a3b8;
          font-size: 14px; font-weight: 500; transition: all 0.2s; white-space: nowrap;
        }
        .nav-item:hover { background: rgba(59,130,246,0.08); color: #f1f5f9; }
        .nav-item.active { background: rgba(59,130,246,0.15); color: #3b82f6; }
        .nav-icon { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
        .sidebar-footer { border-top: 1px solid #1f2d4a; padding: 16px 8px; display: flex; flex-direction: column; gap: 12px; }
        .user-info { display: flex; align-items: center; gap: 10px; padding: 0 4px; overflow: hidden; }
        .user-avatar {
          width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
          color: #fff; flex-shrink: 0;
        }
        .user-name { font-size: 13px; font-weight: 600; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { font-size: 11px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .logout-btn {
          display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px;
          background: transparent; border: 1px solid rgba(239,68,68,0.2); border-radius: 10px;
          color: #ef4444; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.08); }
      `}</style>
    </aside>
  );
};

export default Sidebar;

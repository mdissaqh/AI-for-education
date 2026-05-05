import React, { useState } from 'react';
import { useAdminAuth } from '../hook/useAdminAuth';
import '../style/admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleAdminLogin, loading, error } = useAdminAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    handleAdminLogin(email, password);
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <h2 className="admin-auth-title">ADMIN PORTAL</h2>
        {error && <div className="admin-auth-error">{error}</div>}
        <form className="admin-auth-form" onSubmit={onSubmit}>
          <input
            type="email"
            className="admin-auth-input"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="admin-auth-input"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="admin-auth-button" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
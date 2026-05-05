import React from 'react';
import { useAuth } from '../../auth/hook/useAuth';

const Dashboard = () => {
  const { handleLogout } = useAuth();

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h1>AI Personalized Learning Dashboard</h1>
      <p>Welcome to your learning portal.</p>
      <button 
        onClick={handleLogout}
        style={{
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
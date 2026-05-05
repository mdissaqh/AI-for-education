import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import '../style/auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleRegister, handleGoogleLogin, loading, error } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    handleRegister(name, email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={onSubmit}>
          <input
            type="text"
            className="auth-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="auth-input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-divider">OR</div>
        
        <button className="google-button" onClick={handleGoogleLogin}>
          Sign up with Google
        </button>
        
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
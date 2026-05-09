import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/ocs_logo.png'
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);       
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);  
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <img src={logo} alt="OCS Logo" className="login-logo-large" />
          <h1>OCS IITH</h1>
          <p>Room Booking System</p>
          <span className="login-tagline">Office of Career Services</span>
        </div>
        <div className="login-left-footer">
          <span>Indian Institute of Technology Hyderabad</span>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in with your authorised credentials</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="you@ocs.iith.ac.in"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-hint">
            <span>Only admin and authorised users can access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
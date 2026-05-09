import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">OCS IITH</div>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/book">Book Room</Link>
        <Link to="/my-bookings">My Bookings</Link>
        {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
            {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <div className="nav-user">
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
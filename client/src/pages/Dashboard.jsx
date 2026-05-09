import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>
      <p className="dashboard-role">Role: <span>{user.role}</span></p>

      <div className="dashboard-cards">
        <Link to="/book" className="dash-card">
          <div className="dash-icon">📅</div>
          <h3>Book a Room</h3>
          <p>Search and book rooms for OA, Interviews, or PPTs</p>
        </Link>

        <Link to="/my-bookings" className="dash-card">
          <div className="dash-icon">📋</div>
          <h3>My Bookings</h3>
          <p>View and manage your booking history</p>
        </Link>

        {user.role === 'admin' && (
          <Link to="/admin" className="dash-card admin-card">
            <div className="dash-icon">⚙️</div>
            <h3>Admin Panel</h3>
            <p>Manage users, rooms, and all bookings</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
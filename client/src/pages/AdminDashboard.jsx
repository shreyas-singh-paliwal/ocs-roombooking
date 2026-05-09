import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  const [userForm, setUserForm] = useState({ email: '', password: '', name: '', role: 'core' });
  const [roomForm, setRoomForm] = useState({ block: '', roomName: '', capacity: '', allowedPurposes: [], notes: '' });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'users') {
        const res = await axios.get('http://localhost:2711/api/users');
        setUsers(res.data);
      } else if (activeTab === 'rooms') {
        const res = await axios.get('http://localhost:2711/api/rooms');
        setRooms(res.data);
      } else if (activeTab === 'bookings') {
        const res = await axios.get('http://localhost:2711/api/bookings/all');
        setBookings(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:2711/api/users', userForm);
      setMessage('User created successfully');
      setUserForm({ email: '', password: '', name: '', role: 'core' });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create user');
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:2711/api/rooms', {
        ...roomForm,
        capacity: parseInt(roomForm.capacity)
      });
      setMessage('Room created successfully');
      setRoomForm({ block: '', roomName: '', capacity: '', allowedPurposes: [], notes: '' });
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create room');
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:2711/api/users/${id}`, { isActive: !currentStatus });
      fetchData();
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const toggleRoomStatus = async (id, currentStatus) => {
    try {
      await axios.put(`/api/rooms/${id}`, { isActive: !currentStatus });
      fetchData();
    } catch (error) {
      console.error('Room update error:', error.response?.data || error.message);
      alert('Failed to update room');
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.put(`http://localhost:2711/api/bookings/${id}/admin-cancel`);
      fetchData();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  const handlePurposeChange = (e) => {
    const { value, checked } = e.target;
    setRoomForm(prev => ({
      ...prev,
      allowedPurposes: checked 
        ? [...prev.allowedPurposes, value]
        : prev.allowedPurposes.filter(p => p !== value)
    }));
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Panel</h2>

      <div className="tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Manage Users
        </button>
        <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>
          Manage Rooms
        </button>
        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
          All Bookings
        </button>
      </div>

      {message && <div className="admin-message">{message}</div>}

      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="form-section">
            <h3>Create New User</h3>
            <form onSubmit={createUser} className="admin-form">
              <input placeholder="Name" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required />
              <input placeholder="Email" type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required />
              <input placeholder="Password" type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
              <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                <option value="core">Core (Coordinator)</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit">Create User</button>
            </form>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'confirmed' : 'cancelled'}`}>
                      {u.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td>
                    {u._id !== currentUser?.id && (
                        <button onClick={() => toggleUserStatus(u._id, u.isActive)} className="toggle-btn">
                        {u.isActive ? 'Revoke' : 'Activate'}
                        </button>
                    )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="tab-content">
          <div className="form-section">
            <h3>Add New Room</h3>
            <form onSubmit={createRoom} className="admin-form">
              <input placeholder="Block (e.g., A, LHC)" value={roomForm.block} onChange={e => setRoomForm({...roomForm, block: e.target.value})} required />
              <input placeholder="Room Name" value={roomForm.roomName} onChange={e => setRoomForm({...roomForm, roomName: e.target.value})} required />
              <input placeholder="Capacity" type="number" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} required />
              <div className="checkbox-group">
                <label>Allowed Purposes:</label>
                {['OA', 'Interview', 'PPT'].map(p => (
                  <label key={p} className="checkbox-label">
                    <input type="checkbox" value={p} checked={roomForm.allowedPurposes.includes(p)} onChange={handlePurposeChange} />
                    {p}
                  </label>
                ))}
              </div>
              <input placeholder="Notes (optional)" value={roomForm.notes} onChange={e => setRoomForm({...roomForm, notes: e.target.value})} />
              <button type="submit">Add Room</button>
            </form>
          </div>

          <table className="admin-table">
            <thead>
                <tr>
                <th>Block</th><th>Room</th><th>Capacity</th><th>Allowed</th><th>Status</th><th>Action</th>
                </tr>
            </thead>
            <tbody>
                {rooms.map(r => (
                <tr key={r._id}>
                    <td>{r.block}</td>
                    <td>{r.roomName}</td>
                    <td>{r.capacity}</td>
                    <td>{r.allowedPurposes?.join(', ') || 'All'}</td>
                    <td>
                    <span className={`status-badge ${r.isActive ? 'confirmed' : 'cancelled'}`}>
                        {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                    </td>
                    <td>
                    <button onClick={() => toggleRoomStatus(r._id, r.isActive)} className="toggle-btn">
                        {r.isActive ? 'Disable' : 'Enable'}
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="tab-content">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Room</th><th>Block</th><th>Booked By</th><th>Date</th>
                <th>Time</th><th>Purpose</th><th>Participants</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} className={b.status === 'cancelled' ? 'cancelled' : ''}>
                  <td>{b.room?.roomName}</td>
                  <td>{b.room?.block}</td>
                  <td>{b.bookedBy?.name}</td>
                  <td>{b.date}</td>
                  <td>{b.startTime} - {b.endTime}</td>
                  <td>{b.purpose}</td>
                  <td>{b.participantCount}</td>
                  <td>
                    <span className={`status-badge ${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.status === 'confirmed' && (
                      <button onClick={() => cancelBooking(b._id)} className="cancel-btn">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
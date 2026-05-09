import { useState } from 'react';
import axios from 'axios';
import './BookRoom.css';

const BookRoom = () => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: 'OA',
    participantCount: ''
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const searchRooms = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRooms([]);

    try {
      const res = await axios.get('/api/bookings/available-rooms', {
        params: formData
      });
      setRooms(res.data);
      if (res.data.length === 0) setError('No rooms available for selected criteria');
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const bookRoom = async (roomId) => {
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/bookings', {
        ...formData,
        roomId
      });
      setSuccess('Room booked successfully!');
      setRooms([]);
      setFormData({ date: '', startTime: '', endTime: '', purpose: 'OA', participantCount: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="book-room">
      <h2>Book a Room</h2>

      <form onSubmit={searchRooms} className="search-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Purpose</label>
            <select name="purpose" value={formData.purpose} onChange={handleChange}>
              <option value="OA">Online Assessment (OA)</option>
              <option value="Interview">Interview</option>
              <option value="PPT">Pre-Placement Talk (PPT)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Participants</label>
            <input type="number" name="participantCount" min="1" value={formData.participantCount} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching...' : 'Search Available Rooms'}
        </button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="rooms-grid">
        {rooms.map(room => (
          <div key={room._id} className="room-card">
            <div className="room-header">
              <h4>{room.roomName}</h4>
              <span className="block-badge">{room.block}</span>
            </div>
            <div className="room-details">
              <p><strong>Capacity:</strong> {room.capacity} seats</p>
              {room.allowedPurposes?.length > 0 && (
                <p><strong>Allowed:</strong> {room.allowedPurposes.join(', ')}</p>
              )}
              {room.notes && <p className="room-notes">{room.notes}</p>}
            </div>
            <button onClick={() => bookRoom(room._id)} className="book-btn">
              Book This Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookRoom;
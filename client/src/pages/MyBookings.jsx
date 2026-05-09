import { useState, useEffect } from 'react';
import axios from 'axios';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:2711/api/bookings/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(`http://localhost:2711/api/bookings/${id}/cancel`);
      fetchBookings();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="empty-state">No bookings found</div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Block</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Participants</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} className={b.status === 'cancelled' ? 'cancelled' : ''}>
                  <td>{b.room?.roomName}</td>
                  <td>{b.room?.block}</td>
                  <td>{b.date}</td>
                  <td>{b.startTime} - {b.endTime}</td>
                  <td>{b.purpose}</td>
                  <td>{b.participantCount}</td>
                  <td>
                    <span className={`status-badge ${b.status}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === 'confirmed' && (
                      <button onClick={() => cancelBooking(b._id)} className="cancel-btn">
                        Cancel
                      </button>
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

export default MyBookings;
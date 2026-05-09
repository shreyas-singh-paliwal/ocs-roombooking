const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { verifyToken, requireRole } = require('../middleware/auth');
const router = express.Router();

const hasConflict = async (roomId, date, startTime, endTime, excludeBookingId = null) => {
  const query = {
    room: roomId,
    date: date,
    status: 'confirmed',
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query);
  return conflict !== null;
};

router.get('/available-rooms', verifyToken, async (req, res) => {
  try {
    const { date, startTime, endTime, participantCount, purpose } = req.query;

    if (!date || !startTime || !endTime || !participantCount || !purpose) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const roomFilter = {
      isActive: true,
      capacity: { $gte: parseInt(participantCount) }
    };

    const rooms = await Room.find(roomFilter);

    const eligibleRooms = rooms.filter(room => {
      if (!room.allowedPurposes || room.allowedPurposes.length === 0) return true;
      return room.allowedPurposes.includes(purpose);
    });

    const availableRooms = [];
    for (const room of eligibleRooms) {
      const conflict = await hasConflict(room._id, date, startTime, endTime);
      if (!conflict) {
        availableRooms.push(room);
      }
    }

    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, purpose, participantCount } = req.body;

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (room.capacity < participantCount) {
      return res.status(400).json({ error: 'Room capacity exceeded' });
    }

    if (room.allowedPurposes && room.allowedPurposes.length > 0) {
      if (!room.allowedPurposes.includes(purpose)) {
        return res.status(400).json({ error: 'Purpose not allowed in this room' });
      }
    }

    const conflict = await hasConflict(roomId, date, startTime, endTime);
    if (conflict) {
      return res.status(409).json({ error: 'Time slot conflicts with existing booking' });
    }

    const booking = await Booking.create({
      room: roomId,
      bookedBy: req.userId,
      date,
      startTime,
      endTime,
      purpose,
      participantCount
    });

    await booking.populate('room');
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.userId })
      .populate('room')
      .sort({ date: -1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/all', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .populate('bookedBy', 'name email')
      .sort({ date: -1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, bookedBy: req.userId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/admin-cancel', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
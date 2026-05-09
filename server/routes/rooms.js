const express = require('express');
const Room = require('../models/Room');
const { verifyToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { block, minCapacity, purpose } = req.query;
    const filter = { isActive: true };

    if (block) filter.block = block;
    if (minCapacity) filter.capacity = { $gte: parseInt(minCapacity) };
    if (purpose) filter.allowedPurposes = { $in: [purpose] };

    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { block, roomName, capacity, allowedPurposes, notes, isActive } = req.body;
    
    const updateData = {};
    if (block !== undefined) updateData.block = block;
    if (roomName !== undefined) updateData.roomName = roomName;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (allowedPurposes !== undefined) updateData.allowedPurposes = allowedPurposes;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive === true || isActive === 'true';
    
    const room = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
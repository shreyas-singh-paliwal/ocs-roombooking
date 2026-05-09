const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, name, role, assignedBlocks } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'core',
      assignedBlocks: assignedBlocks || []
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, role, isActive, assignedBlocks } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive, assignedBlocks },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const { User } = require('../models');
const { validationResult } = require('express-validator');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving users',
      error: error.message 
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving user',
      error: error.message 
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const user = await User.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      data: user 
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email address already in use'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user',
      error: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.update(req.body);
    res.json({ 
      success: true, 
      message: 'User updated successfully',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user',
      error: error.message 
    });
  }
};

// Delete user (soft delete by setting isActive to false)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.update({ isActive: false });
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: error.message 
    });
  }
};

// Get all lawyers
exports.getAllLawyers = async (req, res) => {
  try {
    const lawyers = await User.findAll({ 
      where: { role: 'lawyer', isActive: true } 
    });
    res.json({ success: true, data: lawyers });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving lawyers',
      error: error.message 
    });
  }
};

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await User.findAll({ 
      where: { role: 'client', isActive: true } 
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving clients',
      error: error.message 
    });
  }
};
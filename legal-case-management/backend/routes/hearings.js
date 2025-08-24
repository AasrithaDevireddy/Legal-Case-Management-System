const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Basic hearing routes
router.get('/', auth, (req, res) => {
  res.json({ message: 'Hearings endpoint working' });
});

router.post('/', auth, (req, res) => {
  res.json({ message: 'Create hearing endpoint' });
});

module.exports = router;
const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const caseRoutes = require('./cases');
const hearingRoutes = require('./hearings');
const documentRoutes = require('./documents');
const dashboardRoutes = require('./dashboard');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cases', caseRoutes);
router.use('/hearings', hearingRoutes);
router.use('/documents', documentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
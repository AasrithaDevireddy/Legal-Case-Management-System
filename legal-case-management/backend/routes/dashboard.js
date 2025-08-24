const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

// Example backend route for role-specific dashboard data
router.get('/dashboard/role-specific', auth, async (req, res) => {
    try {
        let dashboardData = {};
        
        if (req.user.role === 'client') {
            dashboardData = await getClientDashboardData(req.user.id);
        } else if (req.user.role === 'lawyer') {
            dashboardData = await getLawyerDashboardData(req.user.id);
        } else if (req.user.role === 'admin') {
            dashboardData = await getAdminDashboardData();
        }
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading dashboard data'
        });
    }
});

module.exports = router;
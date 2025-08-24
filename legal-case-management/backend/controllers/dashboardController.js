const { Case, Hearing, Task, Document, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('Getting dashboard stats for:', userId, userRole);
    
    let stats = {
      totalCases: 0,
      upcomingHearings: 0,
      pendingTasks: 0,
      newDocuments: 0
    };
    
    if (userRole === 'client') {
      // Client sees only their cases
      stats.totalCases = await Case.count({ 
        where: { clientId: userId }  // FILTER BY USER ID
      });
      
      stats.upcomingHearings = await Hearing.count({
        include: [{
          model: Case,
          where: { clientId: userId },  // FILTER BY USER ID
          attributes: []
        }],
        where: {
          hearingDate: { [Op.gte]: new Date() },
          status: 'scheduled'
        }
      });
      
    } else if (userRole === 'lawyer') {
      // Lawyer sees cases they're assigned to
      stats.totalCases = await Case.count({
        include: [{
          model: User,
          as: 'lawyers',
          where: { id: userId },  // FILTER BY USER ID
          through: { attributes: [] },
          attributes: []
        }]
      });
      
      stats.upcomingHearings = await Hearing.count({
        include: [{
          model: Case,
          include: [{
            model: User,
            as: 'lawyers',
            where: { id: userId },  // FILTER BY USER ID
            through: { attributes: [] },
            attributes: []
          }],
          attributes: []
        }],
        where: {
          hearingDate: { [Op.gte]: new Date() },
          status: 'scheduled'
        }
      });
      
    } else {
      // Admin sees all cases
      stats.totalCases = await Case.count();
      stats.upcomingHearings = await Hearing.count({
        where: {
          hearingDate: { [Op.gte]: new Date() },
          status: 'scheduled'
        }
      });
    }
    
    // Common stats for all roles (also should be filtered by user)
    stats.pendingTasks = await Task.count({ 
      where: { 
        assignedTo: userId,  // FILTER BY USER ID
        status: 'pending'
      } 
    });
    
    stats.newDocuments = await Document.count({
      where: {
        uploadedBy: userId,  // FILTER BY USER ID
        uploadDate: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });
    
    console.log('Stats calculated:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};
// controllers/caseController.js

const { 
  Case, 
  User, 
  Document, 
  Hearing, 
  CaseLawyerAssignment, 
  CaseStatusHistory, 
  Notification, 
  sequelize 
} = require('../models');
const { v4: uuidv4 } = require('uuid');

// -------------------------
// @desc    Get all cases (Admin only)
// @route   GET /api/cases
// -------------------------
exports.getAllCases = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const cases = await Case.findAll({
      include: [
        { model: User, as: 'client', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'lawyer', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: cases });
  } catch (err) {
    console.error('Error in getAllCases:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------
// @desc    Get cases for logged-in client
// @route   GET /api/cases/client-cases
// -------------------------
exports.getClientCases = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only clients can access this route' });
    }

    const cases = await Case.findAll({
      where: { clientId: req.user.id },
      include: [
        { model: User, as: 'client', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'lawyer', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: cases });
  } catch (err) {
    console.error('Error in getClientCases:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------
// @desc    Get cases for logged-in lawyer
// @route   GET /api/cases/lawyer-cases
// -------------------------
exports.getLawyerCases = async (req, res) => {
  try {
    if (req.user.role !== 'lawyer') {
      return res.status(403).json({ success: false, message: 'Only lawyers can access this route' });
    }

    const cases = await Case.findAll({
      where: { lawyerId: req.user.id },
      include: [
        { model: User, as: 'client', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'lawyer', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: cases });
  } catch (err) {
    console.error('Error in getLawyerCases:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------
// @desc    Get logged-in user's cases
// @route   GET /api/cases/my-cases
// -------------------------
exports.getMyCases = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === 'client') {
      where.clientId = req.user.id;
    } else if (req.user.role === 'lawyer') {
      where.lawyerId = req.user.id;
    } else {
      // For admin, get all cases
      where = {};
    }

    const cases = await Case.findAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'lawyer', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: cases });
  } catch (err) {
    console.error('Error in getMyCases:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------
// @desc    Create a new case
// @route   POST /api/cases
// -------------------------
exports.createCase = async (req, res) => {
  try {
    const { title, description, caseType, filingDate, lawyerId } = req.body;

    // Auto-generate case number
    const caseNumber = `CASE-${uuidv4().split('-')[0].toUpperCase()}`;

    const newCase = await Case.create({
      caseNumber,
      title,
      description,
      caseType,
      filingDate,
      clientId: req.user.role === 'client' ? req.user.id : null,
      lawyerId: lawyerId || null
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (err) {
    console.error('Error in createCase:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------
// @desc    Get single case by ID
// @route   GET /api/cases/:id
// -------------------------
exports.getCase = async (req, res) => {
  try {
    const foundCase = await Case.findByPk(req.params.id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'lawyer', attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });

    if (!foundCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Access control
    if (
      req.user.role !== 'admin' &&
      foundCase.clientId !== req.user.id &&
      foundCase.lawyerId !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: foundCase });
  } catch (err) {
    console.error('Error in getCase:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------
// @desc    Update case
// @route   PUT /api/cases/:id
// -------------------------
exports.updateCase = async (req, res) => {
  try {
    const foundCase = await Case.findByPk(req.params.id);

    if (!foundCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    if (
      req.user.role !== 'admin' &&
      foundCase.lawyerId !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await foundCase.update(req.body);

    res.json({ success: true, data: foundCase });
  } catch (err) {
    console.error('Error in updateCase:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------------
// @desc    Delete case
// @route   DELETE /api/cases/:id
// -------------------------
exports.deleteCase = async (req, res) => {
  try {
    const foundCase = await Case.findByPk(req.params.id);

    if (!foundCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    if (
      req.user.role !== 'admin' &&
      foundCase.lawyerId !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await foundCase.destroy();

    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (err) {
    console.error('Error in deleteCase:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
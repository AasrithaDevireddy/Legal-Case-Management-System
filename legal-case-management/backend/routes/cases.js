const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');

// Validation rules
const caseValidation = [
  body('title')
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('caseType')
    .isIn(['criminal', 'civil', 'family', 'corporate', 'personal_injury', 'divorce', 'other'])
    .withMessage('Invalid case type'),
  body('filingDate')
    .isISO8601()
    .withMessage('Invalid filing date')
];

// Make sure this route exists and points to getMyCases
router.get('/my-cases', auth, caseController.getMyCases);

// Other case routes...
router.get('/', auth, caseController.getAllCases);
router.get('/client-cases', auth, caseController.getClientCases);
router.get('/lawyer-cases', auth, caseController.getLawyerCases);
router.post('/', auth, caseController.createCase);
router.get('/:id', auth, caseController.getCase);
router.put('/:id', auth, caseController.updateCase);
router.delete('/:id', auth, caseController.deleteCase);

module.exports = router;
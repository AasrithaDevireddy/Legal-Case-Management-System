const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');

// Validation rules
const userValidationRules = [
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'lawyer', 'client'])
    .withMessage('Role must be admin, lawyer, or client')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', userController.getAllUsers);
router.get('/lawyers', userController.getAllLawyers);
router.get('/clients', userController.getAllClients);
router.get('/:id', userController.getUserById);
router.post('/', userValidationRules, userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
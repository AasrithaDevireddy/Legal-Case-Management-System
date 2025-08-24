const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { auth } = require('../middleware/auth');

// Routes
router.post('/upload', auth, documentController.uploadDocument);
router.get('/case/:caseId', auth, documentController.getCaseDocuments);

module.exports = router;
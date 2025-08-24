const { Document, Case } = require('../models');
const { upload } = require('../middleware/upload');
const { validationResult } = require('express-validator');

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    // Use multer upload middleware
    upload.single('document')(req, res, async function(err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const { caseId, title, description, category } = req.body;
      
      // Check if case exists and user has access
      const caseData = await Case.findByPk(caseId);
      if (!caseData) {
        return res.status(404).json({
          success: false,
          message: 'Case not found'
        });
      }
      
      if (req.user.role === 'client' && caseData.clientId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Create document record
      const document = await Document.create({
        caseId,
        title: title || req.file.originalname,
        description,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        uploadedBy: req.user.id,
        category: category || 'other'
      });
      
      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Get case documents
exports.getCaseDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    // Check if case exists and user has access
    const caseData = await Case.findByPk(caseId);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }
    
    if (req.user.role === 'client' && caseData.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const documents = await Document.findAll({
      where: { caseId },
      include: [
        {
          model: require('./User'),
          as: 'uploadedByUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['uploadDate', 'DESC']]
    });
    
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};
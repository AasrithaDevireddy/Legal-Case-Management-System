const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cases',  // Ensure your Cases model/table is named exactly "Cases"
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 255] // Title length between 3 and 255 chars
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Ensure your Users model/table is named exactly "Users"
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  uploadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  category: {
    type: DataTypes.ENUM(
      'pleading',
      'evidence',
      'motion',
      'order',
      'brief',
      'contract',
      'other'
    ),
    defaultValue: 'other'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isLatest: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'documents',
  timestamps: false // We are using uploadDate instead
});

module.exports = Document;

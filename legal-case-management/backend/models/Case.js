const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Case = sequelize.define('Case', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  caseType: {
    type: DataTypes.ENUM(
      'criminal',
      'civil',
      'family',
      'corporate',
      'personal_injury',
      'divorce',
      'other'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'closed', 'dismissed'),
    defaultValue: 'open'
  },
  filingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  court: {
    type: DataTypes.STRING
  },
  judge: {
    type: DataTypes.STRING
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Reference the users table
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  lawyerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users', // Reference the users table (lawyers are also users)
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'cases',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['clientId']
    },
    {
      fields: ['lawyerId']
    },
    {
      fields: ['caseNumber'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['caseType']
    }
  ]
});

// Define associations - REMOVE THIS FROM Case.js
// The associations are now defined in index.js
Case.associate = function(models) {
  // These associations are now defined in index.js
  // Remove this function or keep it empty
};

module.exports = Case;
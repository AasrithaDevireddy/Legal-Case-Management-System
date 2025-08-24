const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cases', // ✅ corrected (table name should be lowercase)
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // ✅ corrected
      key: 'id'
    }
  },
  dueDate: {
    type: DataTypes.DATE
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  completedDate: {
    type: DataTypes.DATE
  },
  estimatedHours: {
    type: DataTypes.FLOAT
  },
  actualHours: {
    type: DataTypes.FLOAT
  },
  tags: {
    type: DataTypes.STRING // Comma-separated tags
  }
}, {
  tableName: 'tasks',
  timestamps: true // ✅ adds createdAt and updatedAt automatically
});

module.exports = Task;

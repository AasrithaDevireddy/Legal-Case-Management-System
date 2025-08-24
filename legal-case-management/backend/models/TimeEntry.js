const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimeEntry = sequelize.define('TimeEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lawyerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hours: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.1,
      max: 24
    }
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  taskType: {
    type: DataTypes.ENUM('research', 'drafting', 'meeting', 'court', 'communication', 'other'),
    defaultValue: 'other'
  },
  isBilled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  invoiceId: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'time_entries',
  hooks: {
    beforeSave: (timeEntry) => {
      if (timeEntry.hours && timeEntry.rate) {
        timeEntry.totalAmount = parseFloat(timeEntry.hours) * parseFloat(timeEntry.rate);
      }
    }
  }
});

module.exports = TimeEntry;
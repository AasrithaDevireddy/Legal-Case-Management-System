const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CaseStatusHistory = sequelize.define('CaseStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cases',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'closed', 'dismissed'),
    allowNull: false
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  changeDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'case_status_history'
});

module.exports = CaseStatusHistory;
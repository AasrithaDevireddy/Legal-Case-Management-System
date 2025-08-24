const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CaseLawyerAssignment = sequelize.define('CaseLawyerAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cases',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  lawyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lawyers',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('lead', 'assistant', 'consulting'),
    defaultValue: 'assistant'
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'case_lawyer_assignments',
  timestamps: false
});

module.exports = CaseLawyerAssignment;

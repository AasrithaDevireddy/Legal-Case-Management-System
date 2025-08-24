const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hearing = sequelize.define('Hearing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cases', // ✅ corrected (was 'Cases')
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hearingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING
  },
  purpose: {
    type: DataTypes.TEXT
  },
  outcome: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'postponed'),
    defaultValue: 'scheduled'
  },
  duration: {
    type: DataTypes.INTEGER // in minutes
  },
  judge: {
    type: DataTypes.STRING
  },
  opposingCounsel: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'hearings', // ✅ lowercase plural
  timestamps: true // optional, adds createdAt & updatedAt
});

module.exports = Hearing;

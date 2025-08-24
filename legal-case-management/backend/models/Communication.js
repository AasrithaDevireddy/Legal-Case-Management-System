const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Communication = sequelize.define('communication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  case_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cases',   // ✅ Corrected table name
      key: 'id'
    }
  },
  from_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',   // ✅ Corrected table name
      key: 'id'
    }
  },
  to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  communication_type: {
    type: DataTypes.ENUM('email', 'letter', 'phone', 'meeting', 'other'),
    defaultValue: 'email'
  },
  date_sent: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  }
}, {
  tableName: 'communications',  // ✅ consistent plural table name
  timestamps: false             // disable createdAt/updatedAt (enable if needed)
});

module.exports = Communication;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users', // FK to users.id
      key: 'id'
    }
  },
  adminLevel: {
    type: DataTypes.ENUM('super', 'regular'),
    defaultValue: 'regular'
  },
  permissions: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'admins',
  freezeTableName: true,
  timestamps: false
});

module.exports = Admin;

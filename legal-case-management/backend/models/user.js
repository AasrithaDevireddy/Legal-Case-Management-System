const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name' // Add field mapping for consistency
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name' // Add field mapping for consistency
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'lawyer', 'client'),
    allowNull: false,
    defaultValue: 'client'
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  barNumber: {
    type: DataTypes.STRING,
    field: 'bar_number' // Add field mapping for consistency
  },
  specialization: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active' // Add field mapping for consistency
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Define associations
User.associate = function(models) {
  User.hasMany(models.Case, {
    as: 'clientCases',
    foreignKey: 'clientId'
  });
  
  User.hasMany(models.Case, {
    as: 'lawyerCases',
    foreignKey: 'lawyerId'
  });
  
  // Add other associations if needed
  User.hasMany(models.Document, {
    foreignKey: 'userId',
    as: 'documents'
  });
};

// Instance method to validate password
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
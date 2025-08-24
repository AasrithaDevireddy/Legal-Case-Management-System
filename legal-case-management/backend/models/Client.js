const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define(
  'Client',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // one client profile per user
      references: {
        model: 'users', // 🔹 must match EXACT table name from User model (`users`)
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    companyName: {
      type: DataTypes.STRING,
    },
    contactPerson: {
      type: DataTypes.STRING,
    },
    billingAddress: {
      type: DataTypes.TEXT,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
    },
    taxId: {
      type: DataTypes.STRING,
    },
    paymentTerms: {
      type: DataTypes.ENUM('net_15', 'net_30', 'net_60', 'due_on_receipt'),
      defaultValue: 'net_30',
    },
    creditLimit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    isCorporate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    industry: {
      type: DataTypes.STRING,
    },
    companySize: {
      type: DataTypes.ENUM('small', 'medium', 'large', 'enterprise'),
      defaultValue: 'small',
    },
  },
  {
    tableName: 'clients',
    timestamps: true,
    underscored: true, // user_id instead of userId
    indexes: [{ fields: ['user_id'] }], // 🔹 must match underscored column name
  }
);

module.exports = Client;

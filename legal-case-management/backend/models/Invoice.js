const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cases',  // Reference to cases table
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // CHANGE THIS: Reference users table instead of clients
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  timestamps: true, // adds createdAt and updatedAt
  hooks: {
    beforeSave: (invoice) => {
      const total = parseFloat(invoice.totalAmount || 0);
      const tax = parseFloat(invoice.taxAmount || 0);
      const discount = parseFloat(invoice.discountAmount || 0);
      invoice.finalAmount = total + tax - discount;
    }
  }
});

// Add associations
Invoice.associate = function(models) {
  Invoice.belongsTo(models.Case, {
    foreignKey: 'caseId',
    as: 'case'
  });
  
  Invoice.belongsTo(models.User, {
    foreignKey: 'clientId',
    as: 'client'
  });
};

module.exports = Invoice;
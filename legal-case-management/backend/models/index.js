const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Lawyer = require('./Lawyer');
const Case = require('./Case');
const CaseLawyerAssignment = require('./CaseLawyerAssignment');
const CaseStatusHistory = require('./CaseStatusHistory');
const Communication = require('./Communication');
const Document = require('./Document');
const Hearing = require('./Hearing');
const Task = require('./Task');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const TimeEntry = require('./TimeEntry');

// ---------------- Associations ----------------
const defineAssociations = () => {
  // Users (clients) ↔ Cases
  User.hasMany(Case, { foreignKey: 'clientId', as: 'clientCases' });
  Case.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

  // ADD THIS: Direct lawyer association (CRITICAL FIX)
  User.hasMany(Case, { foreignKey: 'lawyerId', as: 'lawyerCases' });
  Case.belongsTo(User, { foreignKey: 'lawyerId', as: 'lawyer' });

  // Lawyer ↔ User relationship (One-to-One)
  Lawyer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasOne(Lawyer, { foreignKey: 'userId', as: 'lawyerProfile' });

  // Lawyers ↔ Cases (many-to-many via CaseLawyerAssignment)
  Lawyer.belongsToMany(Case, {
    through: CaseLawyerAssignment,
    foreignKey: 'lawyerId',
    otherKey: 'caseId',
    as: 'assignedCases'
  });
  Case.belongsToMany(Lawyer, {
    through: CaseLawyerAssignment,
    foreignKey: 'caseId',
    otherKey: 'lawyerId',
    as: 'assignedLawyers' // Changed from 'lawyers' to avoid conflict
  });

  // Case Status History
  Case.hasMany(CaseStatusHistory, { foreignKey: 'caseId', as: 'statusHistory' });
  CaseStatusHistory.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });
  CaseStatusHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

  // Documents
  Case.hasMany(Document, { foreignKey: 'caseId', as: 'documents' });
  Document.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });
  Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploadedByUser' });

  // Hearings
  Case.hasMany(Hearing, { foreignKey: 'caseId', as: 'hearings' });
  Hearing.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });

  // Tasks
  Case.hasMany(Task, { foreignKey: 'caseId', as: 'tasks' });
  Task.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });
  Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });

  // Invoices
  Case.hasMany(Invoice, { foreignKey: 'caseId', as: 'invoices' });
  Invoice.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });
  Invoice.belongsTo(User, { foreignKey: 'clientId', as: 'client' }); // Use consistent naming

  // Payments
  Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });
  Payment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
  Payment.belongsTo(User, { foreignKey: 'processedBy', as: 'processedByUser' });

  // Time Entries
  Case.hasMany(TimeEntry, { foreignKey: 'caseId', as: 'timeEntries' });
  TimeEntry.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });
  TimeEntry.belongsTo(User, { foreignKey: 'lawyerId', as: 'lawyer' }); // Use User instead of Lawyer
  TimeEntry.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

  // Communications
  Case.hasMany(Communication, { foreignKey: 'caseId', as: 'communications' });
  Communication.belongsTo(Case, { foreignKey: 'caseId', as: 'case' });
  Communication.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
  Communication.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });
  User.hasMany(Communication, { foreignKey: 'fromUserId', as: 'sentCommunications' });
  User.hasMany(Communication, { foreignKey: 'toUserId', as: 'receivedCommunications' });
};

// ---------------- Sync Helper ----------------
const syncDatabase = async (force = false, alter = false) => {
  try {
    // Sync models in correct order to avoid foreign key issues
    await User.sync({ force, alter });
    await Lawyer.sync({ force, alter });
    await Case.sync({ force, alter });
    await CaseLawyerAssignment.sync({ force, alter });
    await CaseStatusHistory.sync({ force, alter });
    await Communication.sync({ force, alter });
    await Document.sync({ force, alter });
    await Hearing.sync({ force, alter });
    await Task.sync({ force, alter });
    await Invoice.sync({ force, alter });
    await Payment.sync({ force, alter });
    await TimeEntry.sync({ force, alter });
    
    // Define associations after all tables are created
    defineAssociations();
    
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  // models
  User,
  Lawyer,
  Case,
  CaseLawyerAssignment,
  CaseStatusHistory,
  Communication,
  Document,
  Hearing,
  Task,
  Invoice,
  Payment,
  TimeEntry,
  // utils
  syncDatabase,
  defineAssociations // Export this so it can be called elsewhere
};
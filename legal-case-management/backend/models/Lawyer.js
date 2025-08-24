const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lawyer = sequelize.define(
  'Lawyer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // ✅ unique constraint here
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    barNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ✅ unique constraint here
    },
    barState: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    barAdmissionDate: {
      type: DataTypes.DATE,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isPartner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    officeLocation: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    education: {
      type: DataTypes.JSON, // ✅ JSON for MySQL
      defaultValue: [],
    },
    certifications: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    currentWorkload: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of active cases',
    },
    maxWorkload: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: 'Maximum number of cases they can handle',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    nextAvailableDate: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'lawyers',
    timestamps: true,
    underscored: true, // snake_case in DB
    indexes: [
      { fields: ['specialization'] }, // ✅ keep only useful index
    ],
    hooks: {
      beforeSave: (lawyer) => {
        lawyer.isAvailable = lawyer.currentWorkload < lawyer.maxWorkload;
      },
    },
  }
);

module.exports = Lawyer;

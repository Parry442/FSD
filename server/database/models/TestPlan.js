const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const TestPlan = sequelize.define('TestPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Name of the test plan'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of the test plan'
  },
  objective: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Objective of the test plan'
  },
  scope: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Scope of the test plan'
  },
  testType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Functional',
    comment: 'Type of testing'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Draft',
    comment: 'Status of the test plan'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User ID who created the plan'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who approved the plan'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when plan was approved'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Start date of testing'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End date of testing'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated duration in hours'
  },
  riskLevel: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'Medium',
    comment: 'Risk level of the test plan'
  },
  environments: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'Environments for testing (stored as JSON string)',
    get() {
      const rawValue = this.getDataValue('environments');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('environments', JSON.stringify(value || []));
    }
  },
  dataDependencies: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'Data dependencies (stored as JSON string)',
    get() {
      const rawValue = this.getDataValue('dataDependencies');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('dataDependencies', JSON.stringify(value || []));
    }
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'Tags for categorization (stored as JSON string)',
    get() {
      const rawValue = this.getDataValue('tags');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value || []));
    }
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Version number of the plan'
  }
}, {
  tableName: 'test_plans'
});

module.exports = TestPlan;
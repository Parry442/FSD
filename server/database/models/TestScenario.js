const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const TestScenario = sequelize.define('TestScenario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  scenarioId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique identifier for the test scenario'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Title of the test scenario'
  },
  moduleFeature: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Module or feature being tested'
  },
  businessProcess: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Business process associated with the scenario'
  },
  scenarioType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Functional',
    comment: 'Type of test scenario'
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Medium',
    comment: 'Priority level of the scenario'
  },
  frequencyOfUse: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'On-Demand',
    comment: 'How frequently this scenario is used'
  },
  owner: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID of the scenario owner'
  },
  scenarioDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Detailed description of the test scenario'
  },
  preconditionsSetup: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Preconditions and setup requirements'
  },
  stepNo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Step number in the test scenario'
  },
  action: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Action to be performed'
  },
  systemRole: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'System or role performing the action'
  },
  input: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Input data required for the action'
  },
  expectedOutcome: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Expected outcome after performing the action'
  },
  testDataRequirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Test data requirements for the scenario'
  },
  automated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the scenario is automated'
  },
  scriptId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID of the automation script if automated'
  },
  dependencies: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dependencies for the test scenario'
  },
  scenarioStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Active',
    comment: 'Current status of the scenario'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'End date for end-dated scenarios'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Last update timestamp'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who reviewed the scenario'
  },
  reviewDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when scenario was reviewed'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Version number of the scenario'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    comment: 'Tags for categorization and filtering (stored as JSON string)',
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
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated duration in minutes'
  },
  riskLevel: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'Medium',
    comment: 'Risk level of the scenario'
  }
}, {
  tableName: 'test_scenarios'
});

// Instance methods
TestScenario.prototype.isEndDated = function() {
  return this.scenarioStatus === 'End-Dated' || 
         (this.endDate && new Date() > this.endDate);
};

TestScenario.prototype.canBeAddedToTestPlan = function() {
  return this.scenarioStatus === 'Active' && !this.isEndDated();
};

TestScenario.prototype.incrementVersion = function() {
  this.version += 1;
  this.lastUpdated = new Date();
};

// Class methods
TestScenario.findActive = function() {
  return this.findAll({
    where: {
      scenarioStatus: 'Active',
      [sequelize.Op.or]: [
        { endDate: null },
        { endDate: { [sequelize.Op.gt]: new Date() } }
      ]
    }
  });
};

TestScenario.findByType = function(type) {
  return this.findAll({ where: { scenarioType: type } });
};

TestScenario.findByModule = function(module) {
  return this.findAll({ where: { moduleFeature: module } });
};

module.exports = TestScenario;
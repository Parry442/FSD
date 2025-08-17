const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const TestPlan = sequelize.define('TestPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  planName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Name of the test plan'
  },
  testType: {
    type: DataTypes.ENUM(
      'Schedule Releases',
      'Regression Testing',
      'UAT',
      'SIT',
      'CPU Testing',
      'Desktop/Browser Compatibility Testing',
      'Patch Testing',
      'Security Testing'
    ),
    allowNull: false
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
  status: {
    type: DataTypes.ENUM('Draft', 'Under Review', 'Approved', 'In Progress', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Draft'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User ID who created the test plan'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID who approved the test plan'
  },
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Planned start date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Planned end date'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated duration in days'
  },
  environment: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Required test environment'
  },
  dataDependencies: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Data dependencies for the test plan'
  },
  riskAssessment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Risk assessment for the test plan'
  },
  assumptions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Assumptions for the test plan'
  },
  constraints: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Constraints for the test plan'
  },
  successCriteria: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Success criteria for the test plan'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Version number of the test plan'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization'
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this is a reusable template'
  },
  templateName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Name if this is a template'
  },
  aiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this plan was AI-generated'
  },
  aiRecommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI recommendations for the test plan'
  }
}, {
  tableName: 'test_plans',
  indexes: [
    {
      fields: ['plan_name']
    },
    {
      fields: ['test_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['is_template']
    }
  ]
});

// Instance methods
TestPlan.prototype.isActive = function() {
  return ['Under Review', 'Approved', 'In Progress'].includes(this.status);
};

TestPlan.prototype.canBeModified = function() {
  return ['Draft', 'Under Review'].includes(this.status);
};

TestPlan.prototype.requiresApproval = function() {
  return this.status === 'Under Review';
};

// Class methods
TestPlan.findByType = function(testType) {
  return this.findAll({ where: { testType, status: { [sequelize.Op.ne]: 'Cancelled' } } });
};

TestPlan.findActive = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Op.in]: ['Under Review', 'Approved', 'In Progress'] }
    }
  });
};

TestPlan.findTemplates = function() {
  return this.findAll({ where: { isTemplate: true } });
};

TestPlan.findByCreator = function(userId) {
  return this.findAll({ where: { createdBy: userId } });
};

module.exports = TestPlan;
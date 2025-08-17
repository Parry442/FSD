const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const TestCycle = sequelize.define('TestCycle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cycleName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Name of the test cycle'
  },
  testPlanId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to the test plan'
  },
  status: {
    type: DataTypes.ENUM('Planning', 'Open', 'In Progress', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Planning'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Actual start date of the test cycle'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Actual end date of the test cycle'
  },
  plannedStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Planned start date'
  },
  plannedEndDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Planned end date'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User ID who created the test cycle'
  },
  assignedTesters: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Array of user IDs assigned as testers'
  },
  environment: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Test environment for this cycle'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes for the test cycle'
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Specific objectives for this test cycle'
  },
  successCriteria: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Success criteria for this test cycle'
  },
  riskLevel: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: true,
    defaultValue: 'Medium'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  estimatedEffort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated effort in person-hours'
  },
  actualEffort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Actual effort spent in person-hours'
  },
  completionPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Percentage of test scenarios completed'
  },
  blockers: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Current blockers or issues'
  },
  nextSteps: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Next steps or actions required'
  }
}, {
  tableName: 'test_cycles',
  indexes: [
    {
      fields: ['cycle_name']
    },
    {
      fields: ['test_plan_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['planned_start_date']
    }
  ]
});

// Instance methods
TestCycle.prototype.isActive = function() {
  return ['Open', 'In Progress'].includes(this.status);
};

TestCycle.prototype.canBeOpened = function() {
  return this.status === 'Planning';
};

TestCycle.prototype.canBeClosed = function() {
  return ['Open', 'In Progress'].includes(this.status);
};

TestCycle.prototype.updateCompletionPercentage = function() {
  // This will be calculated based on test execution results
  return this.completionPercentage;
};

// Class methods
TestCycle.findActive = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Op.in]: ['Open', 'In Progress'] }
    }
  });
};

TestCycle.findByStatus = function(status) {
  return this.findAll({ where: { status } });
};

TestCycle.findByTester = function(testerId) {
  return this.findAll({
    where: {
      assignedTesters: { [sequelize.Op.contains]: [testerId] }
    }
  });
};

TestCycle.findByTestPlan = function(testPlanId) {
  return this.findAll({ where: { testPlanId } });
};

module.exports = TestCycle;
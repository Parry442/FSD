const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const TestExecution = sequelize.define('TestExecution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  testCycleId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to the test cycle'
  },
  testScenarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to the test scenario'
  },
  assignedTester: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User ID of the assigned tester'
  },
  status: {
    type: DataTypes.ENUM('Not Started', 'In Progress', 'Passed', 'Failed', 'Blocked', 'Skipped'),
    allowNull: false,
    defaultValue: 'Not Started'
  },
  executionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when execution started'
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when execution completed'
  },
  actualDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Actual duration in minutes'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Execution notes from the tester'
  },
  screenshots: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Array of screenshot file paths'
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Array of attachment file paths'
  },
  testData: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Test data used during execution'
  },
  environment: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Environment where test was executed'
  },
  browser: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Browser used for web testing'
  },
  device: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Device used for mobile testing'
  },
  defectIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Array of defect IDs if test failed'
  },
  retestCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times this test was retested'
  },
  lastRetestDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date of last retest'
  },
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this execution was automated'
  },
  automationScriptId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID of the automation script if automated'
  },
  automationResult: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed result from automation execution'
  },
  stepResults: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detailed results for each test step'
  },
  executionOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Order of execution within the test cycle'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: true,
    comment: 'Priority level for execution'
  },
  dependencies: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Array of test execution IDs this depends on'
  },
  blockers: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Current blockers preventing execution'
  }
}, {
  tableName: 'test_executions',
  indexes: [
    {
      fields: ['test_cycle_id']
    },
    {
      fields: ['test_scenario_id']
    },
    {
      fields: ['assigned_tester']
    },
    {
      fields: ['status']
    },
    {
      fields: ['execution_date']
    }
  ]
});

// Instance methods
TestExecution.prototype.isCompleted = function() {
  return ['Passed', 'Failed', 'Blocked', 'Skipped'].includes(this.status);
};

TestExecution.prototype.isSuccessful = function() {
  return this.status === 'Passed';
};

TestExecution.prototype.requiresRetest = function() {
  return this.status === 'Failed' && this.defectIds.length > 0;
};

TestExecution.prototype.canBeExecuted = function() {
  return this.status === 'Not Started' || this.status === 'In Progress';
};

// Class methods
TestExecution.findByStatus = function(status) {
  return this.findAll({ where: { status } });
};

TestExecution.findByTester = function(testerId) {
  return this.findAll({ where: { assignedTester: testerId } });
};

TestExecution.findByTestCycle = function(testCycleId) {
  return this.findAll({ where: { testCycleId } });
};

TestExecution.findFailed = function() {
  return this.findAll({ where: { status: 'Failed' } });
};

TestExecution.findPending = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Op.in]: ['Not Started', 'In Progress'] }
    }
  });
};

module.exports = TestExecution;
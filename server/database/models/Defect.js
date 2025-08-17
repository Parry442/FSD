const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Defect = sequelize.define('Defect', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  defectId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique defect identifier'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Title of the defect'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Detailed description of the defect'
  },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical', 'Blocker'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Pending Confirmation', 'Confirmed Closed', 'Reopened'),
    allowNull: false,
    defaultValue: 'Open'
  },
  category: {
    type: DataTypes.ENUM('Functional', 'Non-Functional', 'UI/UX', 'Performance', 'Security', 'Integration', 'Data', 'Environment', 'Other'),
    allowNull: false,
    defaultValue: 'Functional'
  },
  reportedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'User ID who reported the defect'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID assigned to troubleshoot the defect'
  },
  assignedGroup: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Group assigned to troubleshoot (e.g., DBA, Functional SME, Developer)'
  },
  testExecutionId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to the test execution where defect was found'
  },
  testScenarioId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to the test scenario where defect was found'
  },
  testCycleId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to the test cycle where defect was found'
  },
  moduleFeature: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Module or feature where defect was found'
  },
  environment: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Environment where defect was found'
  },
  browser: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Browser where defect was found'
  },
  device: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Device where defect was found'
  },
  stepsToReproduce: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Steps to reproduce the defect'
  },
  expectedBehavior: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Expected behavior'
  },
  actualBehavior: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Actual behavior observed'
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
    comment: 'Test data used when defect was found'
  },
  reportedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  assignedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when defect was assigned'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Due date for resolution'
  },
  resolvedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when defect was resolved'
  },
  closedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when defect was closed'
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from the troubleshooter about the resolution'
  },
  rootCause: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Root cause analysis'
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Solution implemented'
  },
  workaround: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Workaround if available'
  },
  estimatedEffort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated effort in hours'
  },
  actualEffort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Actual effort spent in hours'
  },
  retestRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether retest is required after resolution'
  },
  retestDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when retest was performed'
  },
  retestResult: {
    type: DataTypes.ENUM('Passed', 'Failed', 'Not Retested'),
    allowNull: true,
    defaultValue: 'Not Retested'
  },
  retestNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from retest'
  },
  relatedDefects: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
    comment: 'Array of related defect IDs'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Version where defect was found'
  },
  buildNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Build number where defect was found'
  }
}, {
  tableName: 'defects',
  indexes: [
    {
      fields: ['defectId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['category']
    },
    {
      fields: ['reportedBy']
    },
    {
      fields: ['assignedTo']
    },
    {
      fields: ['reportedDate']
    }
  ]
});

// Instance methods
Defect.prototype.isOpen = function() {
  return ['Open', 'Assigned', 'In Progress'].includes(this.status);
};

Defect.prototype.isResolved = function() {
  return ['Resolved', 'Pending Confirmation', 'Confirmed Closed'].includes(this.status);
};

Defect.prototype.requiresRetest = function() {
  return this.status === 'Resolved' && this.retestRequired;
};

Defect.prototype.canBeAssigned = function() {
  return ['Open'].includes(this.status);
};

Defect.prototype.canBeResolved = function() {
  return ['Assigned', 'In Progress'].includes(this.status);
};

// Class methods
Defect.findOpen = function() {
  return this.findAll({
    where: {
      status: { [sequelize.Op.in]: ['Open', 'Assigned', 'In Progress'] }
    }
  });
};

Defect.findByStatus = function(status) {
  return this.findAll({ where: { status } });
};

Defect.findBySeverity = function(severity) {
  return this.findAll({ where: { severity } });
};

Defect.findByCategory = function(category) {
  return this.findAll({ where: { category } });
};

Defect.findByAssignee = function(assigneeId) {
  return this.findAll({ where: { assignedTo: assigneeId } });
};

Defect.findByReporter = function(reporterId) {
  return this.findAll({ where: { reportedBy: reporterId } });
};

Defect.findRequiringRetest = function() {
  return this.findAll({
    where: {
      status: 'Resolved',
      retestRequired: true
    }
  });
};

module.exports = Defect;
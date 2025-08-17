const { sequelize } = require('./config');
const User = require('./models/User');
const TestScenario = require('./models/TestScenario');
const TestPlan = require('./models/TestPlan');
const TestCycle = require('./models/TestCycle');
const TestExecution = require('./models/TestExecution');
const Defect = require('./models/Defect');

// Define associations
const setupAssociations = () => {
  // User associations
  User.hasMany(TestScenario, { as: 'ownedScenarios', foreignKey: 'owner' });
  User.hasMany(TestPlan, { as: 'createdPlans', foreignKey: 'createdBy' });
  User.hasMany(TestPlan, { as: 'approvedPlans', foreignKey: 'approvedBy' });
  User.hasMany(TestCycle, { as: 'createdCycles', foreignKey: 'createdBy' });
  User.hasMany(TestExecution, { as: 'assignedExecutions', foreignKey: 'assignedTester' });
  User.hasMany(Defect, { as: 'reportedDefects', foreignKey: 'reportedBy' });
  User.hasMany(Defect, { as: 'assignedDefects', foreignKey: 'assignedTo' });
  User.hasMany(TestScenario, { as: 'reviewedScenarios', foreignKey: 'reviewedBy' });

  // TestScenario associations
  TestScenario.belongsTo(User, { as: 'scenarioOwner', foreignKey: 'owner' });
  TestScenario.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewedBy' });
  TestScenario.hasMany(TestExecution, { as: 'executions', foreignKey: 'testScenarioId' });
  TestScenario.hasMany(Defect, { as: 'defects', foreignKey: 'testScenarioId' });

  // TestPlan associations
  TestPlan.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
  TestPlan.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });
  TestPlan.hasMany(TestCycle, { as: 'cycles', foreignKey: 'testPlanId' });

  // TestCycle associations
  TestCycle.belongsTo(TestPlan, { as: 'testPlan', foreignKey: 'testPlanId' });
  TestCycle.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
  TestCycle.hasMany(TestExecution, { as: 'executions', foreignKey: 'testCycleId' });
  TestCycle.hasMany(Defect, { as: 'defects', foreignKey: 'testCycleId' });

  // TestExecution associations
  TestExecution.belongsTo(TestCycle, { as: 'testCycle', foreignKey: 'testCycleId' });
  TestExecution.belongsTo(TestScenario, { as: 'testScenario', foreignKey: 'testScenarioId' });
  TestExecution.belongsTo(User, { as: 'tester', foreignKey: 'assignedTester' });
  TestExecution.hasMany(Defect, { as: 'defects', foreignKey: 'testExecutionId' });

  // Defect associations
  Defect.belongsTo(User, { as: 'reporter', foreignKey: 'reportedBy' });
  Defect.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
  Defect.belongsTo(TestExecution, { as: 'testExecution', foreignKey: 'testExecutionId' });
  Defect.belongsTo(TestScenario, { as: 'testScenario', foreignKey: 'testScenarioId' });
  Defect.belongsTo(TestCycle, { as: 'testCycle', foreignKey: 'testCycleId' });
};

// Sync database
const syncDatabase = async (force = false) => {
  try {
    setupAssociations();
    
    if (force) {
      await sequelize.sync({ force: true });
      console.log('✅ Database synced with force option');
    } else {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced with alter option');
    }
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await syncDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  TestScenario,
  TestPlan,
  TestCycle,
  TestExecution,
  Defect,
  setupAssociations,
  syncDatabase,
  initializeDatabase
};
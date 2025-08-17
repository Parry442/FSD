const { JsonDatabase } = require('./json-db');

async function runJsonMigration() {
  try {
    console.log('🔄 Starting JSON database migration...');
    
    const db = new JsonDatabase();
    
    // Create collections
    const users = await db.getCollection('users');
    const testScenarios = await db.getCollection('testScenarios');
    const testPlans = await db.getCollection('testPlans');
    const testCycles = await db.getCollection('testCycles');
    const testExecutions = await db.getCollection('testExecutions');
    const defects = await db.getCollection('defects');
    
    // Insert sample users
    const adminUser = await users.insert({
      username: 'admin',
      email: 'admin@testingsuite.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhH8eG', // password: admin123
      firstName: 'Admin',
      lastName: 'User',
      role: 'Test Manager',
      department: 'QA',
      isActive: true
    });
    
    const testerUser = await users.insert({
      username: 'tester',
      email: 'tester@testingsuite.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhH8eG', // password: admin123
      firstName: 'Test',
      lastName: 'User',
      role: 'Tester',
      department: 'QA',
      isActive: true
    });
    
    // Insert sample test scenario
    const sampleScenario = await testScenarios.insert({
      scenarioId: 'TS001',
      title: 'User Login Functionality',
      moduleFeature: 'Authentication',
      businessProcess: 'User Access Management',
      scenarioType: 'Functional',
      priority: 'High',
      frequencyOfUse: 'Daily',
      owner: adminUser.id,
      scenarioDescription: 'Verify that users can successfully log in with valid credentials',
      preconditionsSetup: 'User account exists and is active',
      stepNo: 1,
      action: 'Enter valid username and password',
      systemRole: 'End User',
      input: 'Username: testuser, Password: testpass123',
      expectedOutcome: 'User is successfully logged in and redirected to dashboard',
      testDataRequirements: 'Valid user credentials',
      automated: false,
      scenarioStatus: 'Active',
      version: 1,
      tags: ['login', 'authentication', 'functional'],
      estimatedDuration: 5,
      riskLevel: 'Low'
    });
    
    // Insert sample test plan
    const samplePlan = await testPlans.insert({
      planName: 'Authentication Module Testing',
      testType: 'Regression Testing',
      objective: 'Ensure all authentication features work correctly after recent updates',
      scope: 'Login, logout, password reset, and user registration functionality',
      status: 'Approved',
      createdBy: adminUser.id,
      approvedBy: adminUser.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      estimatedDuration: 5,
      environment: 'Test Environment',
      version: 1,
      tags: ['authentication', 'regression', 'critical']
    });
    
    // Insert sample test cycle
    const sampleCycle = await testCycles.insert({
      cycleName: 'Auth Regression Cycle 1',
      testPlanId: samplePlan.id,
      status: 'Open',
      startDate: new Date().toISOString(),
      plannedStartDate: new Date().toISOString(),
      plannedEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      createdBy: adminUser.id,
      assignedTesters: [testerUser.id],
      environment: 'Test Environment',
      objectives: 'Complete regression testing of authentication module',
      successCriteria: 'All critical authentication features pass testing',
      riskLevel: 'Medium',
      priority: 'High',
      estimatedEffort: 16,
      completionPercentage: 0
    });
    
    // Insert sample test execution
    const sampleExecution = await testExecutions.insert({
      testCycleId: sampleCycle.id,
      testScenarioId: sampleScenario.id,
      assignedTester: testerUser.id,
      status: 'Not Started',
      executionDate: null,
      environment: 'Test Environment',
      browser: 'Chrome',
      isAutomated: false,
      priority: 'High'
    });
    
    // Insert sample defect
    const sampleDefect = await defects.insert({
      defectId: 'DEF001',
      title: 'Login fails with special characters in username',
      description: 'Users cannot log in when username contains special characters like @, #, or $',
      severity: 'High',
      priority: 'High',
      status: 'Open',
      category: 'Functional',
      reportedBy: testerUser.id,
      assignedTo: adminUser.id,
      assignedGroup: 'Functional SME',
      testExecutionId: sampleExecution.id,
      testScenarioId: sampleScenario.id,
      testCycleId: sampleCycle.id,
      moduleFeature: 'Authentication',
      environment: 'Test Environment',
      browser: 'Chrome',
      stepsToReproduce: '1. Create user with username containing @ symbol\n2. Try to log in\n3. Login fails with error',
      expectedBehavior: 'User should be able to log in successfully',
      actualBehavior: 'Login fails with validation error',
      reportedDate: new Date().toISOString(),
      estimatedEffort: 4,
      retestRequired: true
    });
    
    console.log('✅ JSON database migration completed successfully!');
    console.log(`📊 Created ${await users.count()} users`);
    console.log(`📊 Created ${await testScenarios.count()} test scenarios`);
    console.log(`📊 Created ${await testPlans.count()} test plans`);
    console.log(`📊 Created ${await testCycles.count()} test cycles`);
    console.log(`📊 Created ${await testExecutions.count()} test executions`);
    console.log(`📊 Created ${await defects.count()} defects`);
    console.log('🚀 Application is ready to run with JSON database!');
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ JSON database migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runJsonMigration();
}

module.exports = { runJsonMigration };
const bcrypt = require('bcryptjs');
const { 
  User, 
  TestScenario, 
  TestPlan, 
  TestCycle, 
  TestExecution, 
  Defect 
} = require('./index');

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@testing.com',
        name: 'Test Manager Admin',
        password: hashedPassword,
        role: 'Test Manager',
        department: 'QA',
        phone: '+1-555-0101',
        status: 'Active',
        permissions: [
          'test_scenarios:read', 'test_scenarios:write', 'test_scenarios:delete',
          'test_plans:read', 'test_plans:write', 'test_plans:delete',
          'test_cycles:read', 'test_cycles:write', 'test_cycles:delete',
          'defects:read', 'defects:write', 'defects:delete',
          'users:read', 'users:write',
          'reports:read', 'reports:write',
          'ai_features:access'
        ]
      },
      {
        username: 'tester1',
        email: 'tester1@testing.com',
        name: 'John Tester',
        password: hashedPassword,
        role: 'Tester',
        department: 'QA',
        phone: '+1-555-0102',
        status: 'Active',
        permissions: [
          'test_scenarios:read',
          'test_plans:read',
          'test_cycles:read',
          'defects:read', 'defects:write',
          'reports:read'
        ]
      },
      {
        username: 'troubleshooter1',
        email: 'dev1@testing.com',
        name: 'Sarah Developer',
        password: hashedPassword,
        role: 'Troubleshooter',
        department: 'Development',
        phone: '+1-555-0103',
        status: 'Active',
        permissions: [
          'test_scenarios:read',
          'test_plans:read',
          'test_cycles:read',
          'defects:read', 'defects:write',
          'reports:read'
        ]
      },
      {
        username: 'viewer1',
        email: 'viewer1@testing.com',
        name: 'Mike Viewer',
        password: hashedPassword,
        role: 'Viewer',
        department: 'Business',
        phone: '+1-555-0104',
        status: 'Active',
        permissions: [
          'test_scenarios:read',
          'test_plans:read',
          'test_cycles:read',
          'defects:read',
          'reports:read'
        ]
      }
    ]);
    
    console.log('✅ Users created successfully');
    
    // Create test scenarios
    const scenarios = await TestScenario.bulkCreate([
      {
        scenarioId: 'TS-001',
        title: 'User Login Functionality',
        moduleFeature: 'Authentication',
        businessProcess: 'User Access Management',
        scenarioType: 'Functional',
        priority: 'High',
        frequencyOfUse: 'Daily',
        owner: users[0].id,
        scenarioDescription: 'Verify that users can successfully log in with valid credentials',
        preconditionsSetup: 'User account exists and is active',
        stepNo: 1,
        action: 'Enter valid username and password',
        systemRole: 'End User',
        input: 'Valid username: admin, Valid password: password123',
        expectedOutcome: 'User is successfully logged in and redirected to dashboard',
        testDataRequirements: 'Active user account with valid credentials',
        automated: true,
        scriptId: 'AUT-001',
        dependencies: 'Database connection, Authentication service',
        scenarioStatus: 'Active',
        tags: ['login', 'authentication', 'functional'],
        estimatedDuration: 5,
        riskLevel: 'Low'
      },
      {
        scenarioId: 'TS-002',
        title: 'User Registration Validation',
        moduleFeature: 'User Management',
        businessProcess: 'User Onboarding',
        scenarioType: 'Functional',
        priority: 'Medium',
        frequencyOfUse: 'Weekly',
        owner: users[0].id,
        scenarioDescription: 'Verify that user registration form validates all required fields',
        preconditionsSetup: 'User registration form is accessible',
        stepNo: 1,
        action: 'Submit registration form with invalid data',
        systemRole: 'End User',
        input: 'Empty required fields or invalid email format',
        expectedOutcome: 'Form displays appropriate validation error messages',
        testDataRequirements: 'Invalid test data for each field',
        automated: false,
        dependencies: 'Frontend validation, Backend validation',
        scenarioStatus: 'Active',
        tags: ['registration', 'validation', 'functional'],
        estimatedDuration: 10,
        riskLevel: 'Medium'
      },
      {
        scenarioId: 'TS-003',
        title: 'Database Connection Performance',
        moduleFeature: 'Database',
        businessProcess: 'System Performance',
        scenarioType: 'Performance',
        priority: 'High',
        frequencyOfUse: 'Monthly',
        owner: users[0].id,
        scenarioDescription: 'Verify database connection response time under load',
        preconditionsSetup: 'Database is running and accessible',
        stepNo: 1,
        action: 'Execute multiple concurrent database queries',
        systemRole: 'System',
        input: '100 concurrent database connections',
        expectedOutcome: 'All connections established within 2 seconds',
        testDataRequirements: 'Performance testing environment',
        automated: true,
        scriptId: 'PERF-001',
        dependencies: 'Performance testing tools, Database load',
        scenarioStatus: 'Active',
        tags: ['performance', 'database', 'load-testing'],
        estimatedDuration: 30,
        riskLevel: 'High'
      }
    ]);
    
    console.log('✅ Test scenarios created successfully');
    
    // Create test plans
    const plans = await TestPlan.bulkCreate([
      {
        name: 'Q4 2024 Regression Testing',
        description: 'Comprehensive regression testing for Q4 2024 release',
        objective: 'Ensure no new defects are introduced in existing functionality',
        scope: 'All critical user journeys and core features',
        testType: 'Regression',
        status: 'Approved',
        createdBy: users[0].id,
        approvedBy: users[0].id,
        environments: ['Staging', 'Production'],
        dataDependencies: ['Test database with sample data'],
        estimatedDuration: 40,
        riskLevel: 'Medium'
      },
      {
        name: 'User Management Module Testing',
        description: 'Testing of user management functionality',
        objective: 'Verify user creation, modification, and deletion works correctly',
        scope: 'User management module and related features',
        testType: 'Functional',
        status: 'Draft',
        createdBy: users[0].id,
        environments: ['Development', 'Staging'],
        dataDependencies: ['User database'],
        estimatedDuration: 16,
        riskLevel: 'Low'
      }
    ]);
    
    console.log('✅ Test plans created successfully');
    
    // Create test cycles
    const cycles = await TestCycle.bulkCreate([
      {
        name: 'Q4 Regression Cycle 1',
        description: 'First cycle of Q4 regression testing',
        testPlanId: plans[0].id,
        status: 'In Progress',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-10-15'),
        createdBy: users[0].id,
        assignedTesters: [users[1].id, users[2].id],
        totalScenarios: 3,
        completedScenarios: 1,
        passedScenarios: 1,
        failedScenarios: 0,
        blockedScenarios: 0,
        progress: 33
      }
    ]);
    
    console.log('✅ Test cycles created successfully');
    
    // Create test executions
    const executions = await TestExecution.bulkCreate([
      {
        testCycleId: cycles[0].id,
        testScenarioId: scenarios[0].id,
        assignedTester: users[1].id,
        status: 'Completed',
        startTime: new Date('2024-10-01T09:00:00Z'),
        endTime: new Date('2024-10-01T09:05:00Z'),
        result: 'Passed',
        comments: 'Login functionality working as expected'
      }
    ]);
    
    console.log('✅ Test executions created successfully');
    
    // Create defects
    const defects = await Defect.bulkCreate([
      {
        title: 'Password reset email not sent',
        description: 'When user requests password reset, no email is sent',
        severity: 'High',
        priority: 'High',
        status: 'Open',
        category: 'Functional',
        reportedBy: users[1].id,
        testScenarioId: scenarios[0].id,
        testCycleId: cycles[0].id,
        environment: 'Staging',
        stepsToReproduce: '1. Go to login page\n2. Click "Forgot Password"\n3. Enter email\n4. Submit form',
        expectedBehavior: 'Password reset email should be sent to user',
        actualBehavior: 'No email is sent, no confirmation message shown',
        version: '1.0.0'
      }
    ]);
    
    console.log('✅ Defects created successfully');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${users.length} users, ${scenarios.length} scenarios, ${plans.length} plans, ${cycles.length} cycles, ${executions.length} executions, ${defects.length} defects`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
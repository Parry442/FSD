const bcrypt = require('bcryptjs');
const { 
  sequelize, 
  User, 
  TestScenario, 
  TestPlan, 
  TestCycle,
  TestExecution,
  Defect 
} = require('./index');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create sample users
    const users = await createSampleUsers();
    console.log(`✅ Created ${users.length} sample users`);

    // Create sample test scenarios
    const scenarios = await createSampleScenarios(users);
    console.log(`✅ Created ${scenarios.length} sample test scenarios`);

    // Create sample test plans
    const plans = await createSampleTestPlans(users, scenarios);
    console.log(`✅ Created ${plans.length} sample test plans`);

    // Create sample test cycles
    const cycles = await createSampleTestCycles(users, plans);
    console.log(`✅ Created ${cycles.length} sample test cycles`);

    // Create sample test executions
    const executions = await createSampleTestExecutions(users, cycles, scenarios);
    console.log(`✅ Created ${executions.length} sample test executions`);

    // Create sample defects
    const defects = await createSampleDefects(users, executions, scenarios);
    console.log(`✅ Created ${defects.length} sample defects`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Sample data is ready for testing and demonstration.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

async function createSampleUsers() {
  const users = [
    {
      username: 'admin',
      email: 'admin@testingsuite.com',
      password: 'Admin123!',
      firstName: 'Test',
      lastName: 'Manager',
      role: 'Test Manager',
      department: 'Quality Assurance',
      isActive: true
    },
    {
      username: 'tester1',
      email: 'tester1@testingsuite.com',
      password: 'Tester123!',
      firstName: 'John',
      lastName: 'Tester',
      role: 'Tester',
      department: 'Quality Assurance',
      isActive: true
    },
    {
      username: 'tester2',
      email: 'tester2@testingsuite.com',
      password: 'Tester123!',
      firstName: 'Jane',
      lastName: 'Tester',
      role: 'Tester',
      department: 'Quality Assurance',
      isActive: true
    },
    {
      username: 'troubleshooter1',
      email: 'troubleshooter1@testingsuite.com',
      password: 'Trouble123!',
      firstName: 'Mike',
      lastName: 'Developer',
      role: 'Troubleshooter',
      department: 'Development',
      isActive: true
    },
    {
      username: 'troubleshooter2',
      email: 'troubleshooter2@testingsuite.com',
      password: 'Trouble123!',
      firstName: 'Sarah',
      lastName: 'DBA',
      role: 'Troubleshooter',
      department: 'Database',
      isActive: true
    },
    {
      username: 'viewer1',
      email: 'viewer1@testingsuite.com',
      password: 'Viewer123!',
      firstName: 'Bob',
      lastName: 'Stakeholder',
      role: 'Viewer',
      department: 'Business',
      isActive: true
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const existingUser = await User.findOne({ where: { username: userData.username } });
    if (!existingUser) {
      const user = await User.create(userData);
      createdUsers.push(user);
    } else {
      createdUsers.push(existingUser);
    }
  }

  return createdUsers;
}

async function createSampleScenarios(users) {
  const scenarios = [
    {
      scenarioId: 'TS001',
      title: 'User Login Validation',
      moduleFeature: 'Authentication',
      businessProcess: 'User Access Management',
      scenarioType: 'Functional',
      priority: 'High',
      frequencyOfUse: 'Daily',
      owner: users.find(u => u.role === 'Test Manager').id,
      scenarioDescription: 'Validate user login functionality with valid and invalid credentials',
      preconditionsSetup: 'User account exists in the system',
      stepNo: 1,
      action: 'Enter valid username and password',
      systemRole: 'User',
      input: 'Valid credentials',
      expectedOutcome: 'User successfully logs in and is redirected to dashboard',
      testDataRequirements: 'Valid user credentials, invalid credentials',
      automated: true,
      scriptId: 'AUTH_001',
      dependencies: 'Database connection, authentication service',
      scenarioStatus: 'Active',
      tags: ['login', 'authentication', 'functional'],
      estimatedDuration: 15,
      riskLevel: 'Low'
    },
    {
      scenarioId: 'TS002',
      title: 'User Registration Flow',
      moduleFeature: 'Authentication',
      businessProcess: 'User Access Management',
      scenarioType: 'Functional',
      priority: 'High',
      frequencyOfUse: 'Weekly',
      owner: users.find(u => u.role === 'Test Manager').id,
      scenarioDescription: 'Test complete user registration process',
      preconditionsSetup: 'Registration form is accessible',
      stepNo: 1,
      action: 'Fill registration form with valid data',
      systemRole: 'User',
      input: 'Valid user information',
      expectedOutcome: 'User account is created successfully',
      testDataRequirements: 'Valid user information, duplicate email',
      automated: false,
      dependencies: 'Email service, database',
      scenarioStatus: 'Active',
      tags: ['registration', 'authentication', 'functional'],
      estimatedDuration: 20,
      riskLevel: 'Medium'
    },
    {
      scenarioId: 'TS003',
      title: 'Database Connection Performance',
      moduleFeature: 'Database',
      businessProcess: 'System Performance',
      scenarioType: 'Performance',
      priority: 'Medium',
      frequencyOfUse: 'Monthly',
      owner: users.find(u => u.role === 'Test Manager').id,
      scenarioDescription: 'Test database connection performance under load',
      preconditionsSetup: 'Database is running and accessible',
      stepNo: 1,
      action: 'Execute multiple concurrent database queries',
      systemRole: 'System',
      input: 'High volume of queries',
      expectedOutcome: 'Response time remains under 2 seconds',
      testDataRequirements: 'Large dataset, multiple concurrent users',
      automated: true,
      scriptId: 'PERF_001',
      dependencies: 'Database server, load testing tools',
      scenarioStatus: 'Active',
      tags: ['performance', 'database', 'load-testing'],
      estimatedDuration: 45,
      riskLevel: 'Medium'
    },
    {
      scenarioId: 'TS004',
      title: 'Cross-Browser Compatibility',
      moduleFeature: 'User Interface',
      businessProcess: 'User Experience',
      scenarioType: 'Non-Functional',
      priority: 'Medium',
      frequencyOfUse: 'Quarterly',
      owner: users.find(u => u.role === 'Test Manager').id,
      scenarioDescription: 'Verify application works across different browsers',
      preconditionsSetup: 'Multiple browsers installed',
      stepNo: 1,
      action: 'Access application in different browsers',
      systemRole: 'User',
      input: 'Various browser configurations',
      expectedOutcome: 'Consistent functionality across all supported browsers',
      testDataRequirements: 'Chrome, Firefox, Safari, Edge browsers',
      automated: false,
      dependencies: 'Browser automation tools',
      scenarioStatus: 'Active',
      tags: ['compatibility', 'browser', 'ui'],
      estimatedDuration: 60,
      riskLevel: 'Low'
    },
    {
      scenarioId: 'TS005',
      title: 'API Security Testing',
      moduleFeature: 'API Gateway',
      businessProcess: 'Security',
      scenarioType: 'Security',
      priority: 'Critical',
      frequencyOfUse: 'Monthly',
      owner: users.find(u => u.role === 'Test Manager').id,
      scenarioDescription: 'Test API endpoints for security vulnerabilities',
      preconditionsSetup: 'API endpoints are accessible',
      stepNo: 1,
      action: 'Attempt unauthorized access to protected endpoints',
      systemRole: 'Attacker',
      input: 'Invalid tokens, SQL injection attempts',
      expectedOutcome: 'All security measures properly block unauthorized access',
      testDataRequirements: 'Security testing tools, invalid credentials',
      automated: true,
      scriptId: 'SEC_001',
      dependencies: 'Security testing framework',
      scenarioStatus: 'Active',
      tags: ['security', 'api', 'penetration-testing'],
      estimatedDuration: 90,
      riskLevel: 'Critical'
    }
  ];

  const createdScenarios = [];
  for (const scenarioData of scenarios) {
    const existingScenario = await TestScenario.findOne({ where: { scenarioId: scenarioData.scenarioId } });
    if (!existingScenario) {
      const scenario = await TestScenario.create(scenarioData);
      createdScenarios.push(scenario);
    } else {
      createdScenarios.push(existingScenario);
    }
  }

  return createdScenarios;
}

async function createSampleTestPlans(users, scenarios) {
  const plans = [
    {
      planName: 'Regression Testing - Q4 2024',
      testType: 'Regression Testing',
      objective: 'Ensure system stability after recent updates',
      scope: 'Core functionality testing across all modules',
      status: 'Approved',
      createdBy: users.find(u => u.role === 'Test Manager').id,
      approvedBy: users.find(u => u.role === 'Test Manager').id,
      approvalDate: new Date(),
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-15'),
      estimatedDuration: 10,
      environment: 'Test Environment',
      dataDependencies: 'Production-like test data',
      riskAssessment: 'Low risk - standard regression testing',
      assumptions: 'All test environments are available',
      constraints: 'Limited to 2 weeks duration',
      successCriteria: '95% pass rate, no critical defects',
      tags: ['regression', 'q4-2024', 'core-functionality'],
      isTemplate: false
    },
    {
      planName: 'UAT Testing - New Features',
      testType: 'UAT',
      objective: 'Validate new features meet business requirements',
      scope: 'New user management features and reporting',
      status: 'Draft',
      createdBy: users.find(u => u.role === 'Test Manager').id,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-30'),
      estimatedDuration: 20,
      environment: 'UAT Environment',
      dataDependencies: 'Business user test data',
      riskAssessment: 'Medium risk - new features',
      assumptions: 'Business users available for testing',
      constraints: 'Dependent on development completion',
      successCriteria: 'All business requirements met, user acceptance',
      tags: ['uat', 'new-features', 'user-management'],
      isTemplate: false
    }
  ];

  const createdPlans = [];
  for (const planData of plans) {
    const existingPlan = await TestPlan.findOne({ where: { planName: planData.planName } });
    if (!existingPlan) {
      const plan = await TestPlan.create(planData);
      createdPlans.push(plan);
    } else {
      createdPlans.push(existingPlan);
    }
  }

  return createdPlans;
}

async function createSampleTestCycles(users, plans) {
  const cycles = [
    {
      cycleName: 'Regression Cycle 1',
      testPlanId: plans[0].id,
      status: 'In Progress',
      startDate: new Date('2024-10-01'),
      plannedStartDate: new Date('2024-10-01'),
      plannedEndDate: new Date('2024-10-15'),
      createdBy: users.find(u => u.role === 'Test Manager').id,
      assignedTesters: [users.find(u => u.username === 'tester1').id, users.find(u => u.username === 'tester2').id],
      environment: 'Test Environment',
      objectives: 'Complete regression testing of core functionality',
      successCriteria: 'All critical scenarios pass',
      riskLevel: 'Low',
      priority: 'High',
      estimatedEffort: 80,
      completionPercentage: 60.00
    },
    {
      cycleName: 'UAT Cycle 1',
      testPlanId: plans[1].id,
      status: 'Planning',
      plannedStartDate: new Date('2024-11-01'),
      plannedEndDate: new Date('2024-11-30'),
      createdBy: users.find(u => u.role === 'Test Manager').id,
      assignedTesters: [users.find(u => u.username === 'tester1').id],
      environment: 'UAT Environment',
      objectives: 'Validate new features with business users',
      successCriteria: 'Business user acceptance',
      riskLevel: 'Medium',
      priority: 'Medium',
      estimatedEffort: 120
    }
  ];

  const createdCycles = [];
  for (const cycleData of cycles) {
    const existingCycle = await TestCycle.findOne({ where: { cycleName: cycleData.cycleName } });
    if (!existingCycle) {
      const cycle = await TestCycle.create(cycleData);
      createdCycles.push(cycle);
    } else {
      createdCycles.push(existingCycle);
    }
  }

  return createdCycles;
}

async function createSampleTestExecutions(users, cycles, scenarios) {
  const executions = [
    {
      testCycleId: cycles[0].id,
      testScenarioId: scenarios[0].id,
      assignedTester: users.find(u => u.username === 'tester1').id,
      status: 'Passed',
      executionDate: new Date('2024-10-01T09:00:00'),
      completionDate: new Date('2024-10-01T09:15:00'),
      actualDuration: 15,
      notes: 'Login functionality working as expected',
      environment: 'Test Environment',
      browser: 'Chrome',
      isAutomated: true,
      automationScriptId: 'AUTH_001',
      executionOrder: 1,
      priority: 'High'
    },
    {
      testCycleId: cycles[0].id,
      testScenarioId: scenarios[1].id,
      assignedTester: users.find(u => u.username === 'tester2').id,
      status: 'In Progress',
      executionDate: new Date('2024-10-01T10:00:00'),
      actualDuration: 10,
      notes: 'Currently testing registration form validation',
      environment: 'Test Environment',
      browser: 'Firefox',
      isAutomated: false,
      executionOrder: 2,
      priority: 'High'
    },
    {
      testCycleId: cycles[0].id,
      testScenarioId: scenarios[2].id,
      assignedTester: users.find(u => u.username === 'tester1').id,
      status: 'Not Started',
      executionOrder: 3,
      priority: 'Medium'
    }
  ];

  const createdExecutions = [];
  for (const executionData of executions) {
    const existingExecution = await TestExecution.findOne({ 
      where: { 
        testCycleId: executionData.testCycleId,
        testScenarioId: executionData.testScenarioId
      }
    });
    if (!existingExecution) {
      const execution = await TestExecution.create(executionData);
      createdExecutions.push(execution);
    } else {
      createdExecutions.push(existingExecution);
    }
  }

  return createdExecutions;
}

async function createSampleDefects(users, executions, scenarios) {
  const defects = [
    {
      defectId: 'DEF001',
      title: 'Registration form validation error',
      description: 'Registration form allows submission with invalid email format',
      severity: 'Medium',
      priority: 'Medium',
      status: 'Open',
      category: 'Functional',
      reportedBy: users.find(u => u.username === 'tester2').id,
      testExecutionId: executions[1].id,
      testScenarioId: scenarios[1].id,
      testCycleId: executions[1].testCycleId,
      moduleFeature: 'Authentication',
      environment: 'Test Environment',
      browser: 'Firefox',
      stepsToReproduce: '1. Navigate to registration page\n2. Enter invalid email format\n3. Submit form',
      expectedBehavior: 'Form should show validation error for invalid email',
      actualBehavior: 'Form submits successfully with invalid email',
      testData: 'Invalid email: test@invalid',
      dueDate: new Date('2024-10-10'),
      estimatedEffort: 4,
      tags: ['registration', 'validation', 'ui']
    },
    {
      defectId: 'DEF002',
      title: 'Performance degradation under load',
      description: 'System response time increases significantly under high load',
      severity: 'High',
      priority: 'High',
      status: 'Assigned',
      category: 'Performance',
      reportedBy: users.find(u => u.username === 'tester1').id,
      testExecutionId: executions[0].id,
      testScenarioId: scenarios[2].id,
      testCycleId: executions[0].testCycleId,
      moduleFeature: 'Database',
      environment: 'Test Environment',
      stepsToReproduce: '1. Execute concurrent database queries\n2. Monitor response times\n3. Compare with baseline',
      expectedBehavior: 'Response time should remain under 2 seconds',
      actualBehavior: 'Response time increases to 5+ seconds under load',
      testData: 'High volume concurrent queries',
      assignedTo: users.find(u => u.username === 'troubleshooter2').id,
      assignedGroup: 'Database',
      assignedDate: new Date(),
      dueDate: new Date('2024-10-08'),
      estimatedEffort: 8,
      tags: ['performance', 'database', 'load-testing']
    }
  ];

  const createdDefects = [];
  for (const defectData of defects) {
    const existingDefect = await Defect.findOne({ where: { defectId: defectData.defectId } });
    if (!existingDefect) {
      const defect = await Defect.create(defectData);
      createdDefects.push(defect);
    } else {
      createdDefects.push(existingDefect);
    }
  }

  return createdDefects;
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
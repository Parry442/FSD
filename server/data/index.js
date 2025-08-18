const { v4: uuidv4 } = require('uuid');

// Hardcoded sample data
const users = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$rQZ9K8mN2pL1vX3cR5tY7wE9sA4bC6dF8gH0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9',
    name: 'Test Manager',
    email: 'admin@testing.com',
    role: 'Test Manager',
    phone: '+1-555-0123',
    avatar: 'https://via.placeholder.com/150',
    status: 'Active',
    permissions: ['all'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    username: 'tester1',
    password: '$2a$10$rQZ9K8mN2pL1vX3cR5tY7wE9sA4bC6dF8gH0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9',
    name: 'John Tester',
    email: 'tester1@testing.com',
    role: 'Tester',
    phone: '+1-555-0124',
    avatar: 'https://via.placeholder.com/150',
    status: 'Active',
    permissions: ['execute_tests', 'report_defects', 'view_assigned'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    username: 'troubleshooter1',
    password: '$2a$10$rQZ9K8mN2pL1vX3cR5tY7wE9sA4bC6dF8gH0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9',
    name: 'Sarah Troubleshooter',
    email: 'troubleshooter1@testing.com',
    role: 'Troubleshooter',
    phone: '+1-555-0125',
    avatar: 'https://via.placeholder.com/150',
    status: 'Active',
    permissions: ['investigate_defects', 'resolve_defects', 'view_assigned_defects'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    username: 'viewer1',
    password: '$2a$10$rQZ9K8mN2pL1vX3cR5tY7wE9sA4bC6dF8gH0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9',
    name: 'Mike Viewer',
    email: 'viewer1@testing.com',
    role: 'Viewer',
    phone: '+1-555-0126',
    avatar: 'https://via.placeholder.com/150',
    status: 'Active',
    permissions: ['view_all', 'download_reports'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

const testScenarios = [
  {
    id: '1',
    scenarioId: 'TS-001',
    title: 'User Login Functionality',
    module: 'Authentication',
    businessProcess: 'User Access Management',
    scenarioType: 'Functional',
    priority: 'High',
    frequencyOfUse: 'Daily',
    owner: 'admin',
    scenarioDescription: 'Verify that users can successfully log in with valid credentials',
    preconditions: 'User account exists and is active',
    testSteps: [
      { stepNo: 1, action: 'Navigate to login page', systemRole: 'User', input: 'Click login button', expectedOutcome: 'Login page loads', testData: 'Valid user credentials' },
      { stepNo: 2, action: 'Enter username', systemRole: 'User', input: 'admin', expectedOutcome: 'Username field populated', testData: 'admin' },
      { stepNo: 3, action: 'Enter password', systemRole: 'User', input: 'password123', expectedOutcome: 'Password field populated', testData: 'password123' },
      { stepNo: 4, action: 'Click submit', systemRole: 'User', input: 'Click submit button', expectedOutcome: 'User logged in successfully', testData: 'Valid credentials' }
    ],
    automatedScriptId: 'AS-001',
    dependencies: ['User database', 'Authentication service'],
    scenarioStatus: 'Active',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    reviewedBy: 'admin',
    tags: ['authentication', 'login', 'security'],
    riskLevel: 'Medium',
    version: 1
  },
  {
    id: '2',
    scenarioId: 'TS-002',
    title: 'User Registration',
    module: 'Authentication',
    businessProcess: 'User Access Management',
    scenarioType: 'Functional',
    priority: 'High',
    frequencyOfUse: 'Weekly',
    owner: 'admin',
    scenarioDescription: 'Verify that new users can register successfully',
    preconditions: 'Registration service is available',
    testSteps: [
      { stepNo: 1, action: 'Navigate to registration page', systemRole: 'User', input: 'Click register button', expectedOutcome: 'Registration page loads', testData: 'New user details' },
      { stepNo: 2, action: 'Fill registration form', systemRole: 'User', input: 'Complete all required fields', expectedOutcome: 'Form validation passes', testData: 'Valid user data' },
      { stepNo: 3, action: 'Submit registration', systemRole: 'User', input: 'Click submit button', expectedOutcome: 'User account created', testData: 'New user credentials' }
    ],
    automatedScriptId: 'AS-002',
    dependencies: ['User database', 'Email service'],
    scenarioStatus: 'Active',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    reviewedBy: 'admin',
    tags: ['authentication', 'registration', 'user-management'],
    riskLevel: 'Medium',
    version: 1
  },
  {
    id: '3',
    scenarioId: 'TS-003',
    title: 'Password Reset',
    module: 'Authentication',
    businessProcess: 'User Access Management',
    scenarioType: 'Functional',
    priority: 'Medium',
    frequencyOfUse: 'Monthly',
    owner: 'admin',
    scenarioDescription: 'Verify password reset functionality works correctly',
    preconditions: 'User account exists',
    testSteps: [
      { stepNo: 1, action: 'Navigate to password reset page', systemRole: 'User', input: 'Click forgot password link', expectedOutcome: 'Password reset page loads', testData: 'User email' },
      { stepNo: 2, action: 'Enter email address', systemRole: 'User', input: 'user@example.com', expectedOutcome: 'Email field populated', testData: 'Valid email' },
      { stepNo: 3, action: 'Submit reset request', systemRole: 'User', input: 'Click submit button', expectedOutcome: 'Reset email sent', testData: 'Registered email' }
    ],
    automatedScriptId: 'AS-003',
    dependencies: ['Email service', 'Password reset service'],
    scenarioStatus: 'Active',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    reviewedBy: 'admin',
    tags: ['authentication', 'password-reset', 'email'],
    riskLevel: 'Low',
    version: 1
  }
];

const testPlans = [
  {
    id: '1',
    name: 'Regression Testing - Q1 2024',
    description: 'Comprehensive regression testing for Q1 2024 release',
    objective: 'Ensure no regressions in core functionality after recent updates',
    scope: 'All critical user paths and core business processes',
    testType: 'Regression Testing',
    status: 'Approved',
    createdBy: '1',
    approvedBy: '1',
    approvedAt: '2024-01-01T00:00:00.000Z',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-01-30T00:00:00.000Z',
    estimatedDuration: 80,
    riskLevel: 'Medium',
    environments: ['Development', 'Staging', 'Production'],
    dataDependencies: ['User database', 'Test data sets'],
    tags: ['regression', 'q1-2024', 'critical'],
    version: 1
  },
  {
    id: '2',
    name: 'UAT Testing - New Features',
    description: 'User acceptance testing for new feature set',
    objective: 'Validate new features meet business requirements',
    scope: 'New user management features and reporting enhancements',
    testType: 'UAT',
    status: 'Draft',
    createdBy: '1',
    approvedBy: null,
    approvedAt: null,
    startDate: '2024-02-01T00:00:00.000Z',
    endDate: '2024-02-15T00:00:00.000Z',
    estimatedDuration: 60,
    riskLevel: 'High',
    environments: ['UAT Environment'],
    dataDependencies: ['Production data snapshot', 'Test user accounts'],
    tags: ['uat', 'new-features', 'user-management'],
    version: 1
  }
];

const testCycles = [
  {
    id: '1',
    name: 'Q1 2024 Regression Cycle',
    testPlanId: '1',
    status: 'In Progress',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-01-30T00:00:00.000Z',
    createdBy: '1',
    assignedTesters: ['2', '3'],
    progress: 65,
    totalScenarios: 20,
    completedScenarios: 13,
    failedScenarios: 2,
    passedScenarios: 11,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'New Features UAT Cycle',
    testPlanId: '2',
    status: 'Planning',
    startDate: '2024-02-01T00:00:00.000Z',
    endDate: '2024-02-15T00:00:00.000Z',
    createdBy: '1',
    assignedTesters: ['2'],
    progress: 0,
    totalScenarios: 15,
    completedScenarios: 0,
    failedScenarios: 0,
    passedScenarios: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

const defects = [
  {
    id: '1',
    defectId: 'DEF-001',
    title: 'Login page not loading on mobile devices',
    description: 'The login page fails to load properly on mobile devices with iOS Safari',
    severity: 'High',
    priority: 'High',
    status: 'Open',
    category: 'UI/UX',
    assignedTo: '3',
    reportedBy: '2',
    testScenarioId: '1',
    testCycleId: '1',
    environment: 'Production',
    browser: 'iOS Safari',
    stepsToReproduce: '1. Open mobile Safari\n2. Navigate to login page\n3. Page fails to load',
    expectedBehavior: 'Login page should load normally on mobile devices',
    actualBehavior: 'Page shows blank screen or error message',
    attachments: ['screenshot1.png', 'error_log.txt'],
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
    resolvedAt: null,
    closedAt: null,
    resolutionNotes: null
  },
  {
    id: '2',
    defectId: 'DEF-002',
    title: 'Password reset email not being sent',
    description: 'Users are not receiving password reset emails when requested',
    severity: 'Medium',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Backend',
    assignedTo: '3',
    reportedBy: '2',
    testScenarioId: '3',
    testCycleId: '1',
    environment: 'Staging',
    browser: 'All browsers',
    stepsToReproduce: '1. Navigate to password reset page\n2. Enter valid email\n3. Submit request',
    expectedBehavior: 'Password reset email should be sent to user',
    actualBehavior: 'No email is sent, no confirmation message',
    attachments: ['email_log.txt'],
    createdAt: '2024-01-18T14:00:00.000Z',
    updatedAt: '2024-01-19T09:00:00.000Z',
    resolvedAt: null,
    closedAt: null,
    resolutionNotes: 'Investigating email service configuration'
  }
];

// Simple in-memory storage
let data = {
  users: [...users],
  testScenarios: [...testScenarios],
  testPlans: [...testPlans],
  testCycles: [...testCycles],
  defects: [...defects]
};

// Helper functions
const findById = (collection, id) => collection.find(item => item.id === id);
const findByUsername = (username) => data.users.find(user => user.username === username);
const generateId = () => uuidv4();

// Data access methods
const dataAccess = {
  // Users
  getUsers: () => [...data.users],
  getUserById: (id) => findById(data.users, id),
  getUserByUsername: (username) => findByUsername(username),
  createUser: (userData) => {
    const newUser = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.users.push(newUser);
    return newUser;
  },
  updateUser: (id, updates) => {
    const userIndex = data.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return data.users[userIndex];
  },
  deleteUser: (id) => {
    const userIndex = data.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    data.users.splice(userIndex, 1);
    return true;
  },

  // Test Scenarios
  getTestScenarios: () => [...data.testScenarios],
  getTestScenarioById: (id) => findById(data.testScenarios, id),
  createTestScenario: (scenarioData) => {
    const newScenario = {
      id: generateId(),
      ...scenarioData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.testScenarios.push(newScenario);
    return newScenario;
  },
  updateTestScenario: (id, updates) => {
    const scenarioIndex = data.testScenarios.findIndex(scenario => scenario.id === id);
    if (scenarioIndex === -1) return null;
    
    data.testScenarios[scenarioIndex] = {
      ...data.testScenarios[scenarioIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return data.testScenarios[scenarioIndex];
  },
  deleteTestScenario: (id) => {
    const scenarioIndex = data.testScenarios.findIndex(scenario => scenario.id === id);
    if (scenarioIndex === -1) return false;
    
    data.testScenarios.splice(scenarioIndex, 1);
    return true;
  },

  // Test Plans
  getTestPlans: () => [...data.testPlans],
  getTestPlanById: (id) => findById(data.testPlans, id),
  createTestPlan: (planData) => {
    const newPlan = {
      id: generateId(),
      ...planData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.testPlans.push(newPlan);
    return newPlan;
  },
  updateTestPlan: (id, updates) => {
    const planIndex = data.testPlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return null;
    
    data.testPlans[planIndex] = {
      ...data.testPlans[planIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return data.testPlans[planIndex];
  },
  deleteTestPlan: (id) => {
    const planIndex = data.testPlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return false;
    
    data.testPlans.splice(planIndex, 1);
    return true;
  },

  // Test Cycles
  getTestCycles: () => [...data.testCycles],
  getTestCycleById: (id) => findById(data.testCycles, id),
  createTestCycle: (cycleData) => {
    const newCycle = {
      id: generateId(),
      ...cycleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.testCycles.push(newCycle);
    return newCycle;
  },
  updateTestCycle: (id, updates) => {
    const cycleIndex = data.testCycles.findIndex(cycle => cycle.id === id);
    if (cycleIndex === -1) return null;
    
    data.testCycles[cycleIndex] = {
      ...data.testCycles[cycleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return data.testCycles[cycleIndex];
  },
  deleteTestCycle: (id) => {
    const cycleIndex = data.testCycles.findIndex(cycle => cycle.id === id);
    if (cycleIndex === -1) return false;
    
    data.testCycles.splice(cycleIndex, 1);
    return true;
  },

  // Defects
  getDefects: () => [...data.defects],
  getDefectById: (id) => findById(data.defects, id),
  createDefect: (defectData) => {
    const newDefect = {
      id: generateId(),
      ...defectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.defects.push(newDefect);
    return newDefect;
  },
  updateDefect: (id, updates) => {
    const defectIndex = data.defects.findIndex(defect => defect.id === id);
    if (defectIndex === -1) return null;
    
    data.defects[defectIndex] = {
      ...data.defects[defectIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return data.defects[defectIndex];
  },
  deleteDefect: (id) => {
    const defectIndex = data.defects.findIndex(defect => defect.id === id);
    if (defectIndex === -1) return false;
    
    data.defects.splice(defectIndex, 1);
    return true;
  },

  // Dashboard data
  getDashboardData: () => {
    const totalScenarios = data.testScenarios.length;
    const activeScenarios = data.testScenarios.filter(s => s.scenarioStatus === 'Active').length;
    const totalPlans = data.testPlans.length;
    const activeCycles = data.testCycles.filter(c => c.status === 'In Progress').length;
    const openDefects = data.defects.filter(d => d.status === 'Open').length;
    const resolvedDefects = data.defects.filter(d => d.status === 'Resolved').length;

    return {
      totalScenarios,
      activeScenarios,
      totalPlans,
      activeCycles,
      openDefects,
      resolvedDefects,
      recentActivity: [
        ...data.testCycles.slice(-5),
        ...data.defects.slice(-5)
      ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10)
    };
  }
};

module.exports = dataAccess;
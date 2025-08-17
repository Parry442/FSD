const { AwsDatabase } = require('./aws-db');
const AWS = require('aws-sdk');

async function runAwsMigration() {
  try {
    console.log('🔄 Starting AWS infrastructure migration...');
    
    // Initialize AWS database
    const db = new AwsDatabase();
    
    // Create DynamoDB table
    console.log('📊 Creating DynamoDB table...');
    await db.initializeTable();
    
    // Create S3 bucket if it doesn't exist
    console.log('🪣 Setting up S3 bucket...');
    await createS3Bucket();
    
    // Initialize sample data
    console.log('📝 Initializing sample data...');
    await initializeSampleData(db);
    
    console.log('✅ AWS migration completed successfully!');
    
    // Close connections
    await db.close();
    
  } catch (error) {
    console.error('❌ AWS migration failed:', error);
    process.exit(1);
  }
}

async function createS3Bucket() {
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  const bucketName = process.env.S3_BUCKET || 'testing-suite-logs';
  
  try {
    await s3.createBucket({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION === 'us-east-1' ? undefined : process.env.AWS_REGION
      }
    }).promise();
    
    console.log(`✅ S3 bucket '${bucketName}' created successfully`);
    
    // Set bucket policy for testing suite
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'TestingSuiteAccess',
          Effect: 'Allow',
          Principal: {
            AWS: process.env.AWS_ACCOUNT_ID || '*'
          },
          Action: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket'
          ],
          Resource: [
            `arn:aws:s3:::${bucketName}`,
            `arn:aws:s3:::${bucketName}/*`
          ]
        }
      ]
    };
    
    await s3.putBucketPolicy({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    
    console.log('✅ S3 bucket policy configured');
    
  } catch (error) {
    if (error.code === 'BucketAlreadyExists') {
      console.log(`ℹ️ S3 bucket '${bucketName}' already exists`);
    } else {
      console.error('❌ Failed to create S3 bucket:', error);
      throw error;
    }
  }
}

async function initializeSampleData(db) {
  try {
    // Create sample users
    const adminUser = await db.create('users', {
      username: 'admin',
      email: 'admin@testingsuite.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhH8eG', // admin123
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true
    });
    
    const testerUser = await db.create('users', {
      username: 'tester',
      email: 'tester@testingsuite.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhH8eG', // admin123
      role: 'tester',
      firstName: 'Test',
      lastName: 'User',
      isActive: true
    });
    
    console.log('✅ Sample users created');
    
    // Create sample test plans
    const testPlan = await db.create('testPlans', {
      planName: 'E-commerce Platform Testing',
      description: 'Comprehensive testing plan for e-commerce platform',
      testType: 'end-to-end',
      status: 'active',
      createdBy: adminUser.id,
      isTemplate: false,
      priority: 'high',
      estimatedDuration: 480, // 8 hours
      testScenarios: [],
      testCycles: []
    });
    
    console.log('✅ Sample test plan created');
    
    // Create sample test scenarios
    const testScenario = await db.create('testScenarios', {
      scenarioName: 'User Registration Flow',
      description: 'Test user registration process end-to-end',
      moduleFeature: 'user-management',
      scenarioType: 'functional',
      priority: 'high',
      scenarioStatus: 'active',
      owner: testerUser.id,
      testPlanId: testPlan.id,
      prerequisites: ['Database connection', 'Email service'],
      testSteps: [
        'Navigate to registration page',
        'Fill in user details',
        'Submit registration form',
        'Verify email confirmation',
        'Complete account activation'
      ],
      expectedResults: [
        'User account created successfully',
        'Confirmation email sent',
        'Account activated after email verification'
      ],
      testData: {
        validUser: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        }
      }
    });
    
    console.log('✅ Sample test scenario created');
    
    // Create sample test cycle
    const testCycle = await db.create('testCycles', {
      cycleName: 'Sprint 1 Testing',
      description: 'Testing cycle for Sprint 1 features',
      testPlanId: testPlan.id,
      status: 'active',
      createdBy: adminUser.id,
      plannedStartDate: new Date().toISOString(),
      plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      actualStartDate: new Date().toISOString(),
      testScenarios: [testScenario.id],
      assignedTesters: [testerUser.id],
      environment: 'staging',
      testData: 'Sprint 1 test data set'
    });
    
    console.log('✅ Sample test cycle created');
    
    // Create sample test execution
    const testExecution = await db.create('testExecutions', {
      testCycleId: testCycle.id,
      testScenarioId: testScenario.id,
      assignedTester: testerUser.id,
      status: 'in-progress',
      executionDate: new Date().toISOString(),
      startTime: new Date().toISOString(),
      endTime: null,
      actualResults: 'Test execution in progress',
      defects: [],
      attachments: [],
      notes: 'Initial test execution started',
      environment: 'staging',
      browser: 'chrome',
      device: 'desktop'
    });
    
    console.log('✅ Sample test execution created');
    
    // Create sample defect
    const defect = await db.create('defects', {
      defectId: 'DEF-001',
      title: 'User registration fails with invalid email format',
      description: 'Registration form accepts invalid email formats without validation',
      status: 'open',
      severity: 'medium',
      priority: 'high',
      category: 'functional',
      reportedBy: testerUser.id,
      assignedTo: adminUser.id,
      reportedDate: new Date().toISOString(),
      testExecutionId: testExecution.id,
      testScenarioId: testScenario.id,
      stepsToReproduce: [
        'Navigate to registration page',
        'Enter invalid email format (e.g., "invalid-email")',
        'Submit the form'
      ],
      expectedBehavior: 'Form should show validation error for invalid email',
      actualBehavior: 'Form accepts invalid email and proceeds',
      attachments: [],
      environment: 'staging',
      browser: 'chrome',
      device: 'desktop'
    });
    
    console.log('✅ Sample defect created');
    
    // Upload sample test artifacts to S3
    const testArtifacts = {
      testResults: {
        totalTests: 1,
        passedTests: 0,
        failedTests: 1,
        executionTime: 120
      },
      screenshots: [
        'registration-page.png',
        'validation-error.png'
      ],
      logs: 'Test execution logs for user registration flow'
    };
    
    await db.uploadFile(
      `test-executions/${testExecution.id}/artifacts.json`,
      testArtifacts,
      'application/json'
    );
    
    console.log('✅ Sample test artifacts uploaded to S3');
    
  } catch (error) {
    console.error('❌ Failed to initialize sample data:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runAwsMigration();
}

module.exports = { runAwsMigration };
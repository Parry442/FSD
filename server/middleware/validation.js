const Joi = require('joi');

// Validation schemas
const schemas = {
  // User registration validation
  registration: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 50 characters',
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .max(100)
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email must not exceed 100 characters',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(255)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password must not exceed 255 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name is required',
        'string.max': 'First name must not exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name is required',
        'string.max': 'Last name must not exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    role: Joi.string()
      .valid('Test Manager', 'Tester', 'Troubleshooter', 'Viewer')
      .required()
      .messages({
        'any.only': 'Role must be one of: Test Manager, Tester, Troubleshooter, Viewer',
        'any.required': 'Role is required'
      }),
    department: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Department must not exceed 100 characters'
      })
  }),

  // User login validation
  login: Joi.object({
    username: Joi.string()
      .required()
      .messages({
        'any.required': 'Username or email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Test scenario validation
  testScenario: Joi.object({
    scenarioId: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'Scenario ID must not exceed 50 characters',
        'any.required': 'Scenario ID is required'
      }),
    title: Joi.string()
      .max(200)
      .required()
      .messages({
        'string.max': 'Title must not exceed 200 characters',
        'any.required': 'Title is required'
      }),
    moduleFeature: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Module/Feature must not exceed 100 characters',
        'any.required': 'Module/Feature is required'
      }),
    businessProcess: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Business Process must not exceed 200 characters'
      }),
    scenarioType: Joi.string()
      .valid('Functional', 'Non-Functional', 'Integration', 'Regression', 'UAT', 'SIT', 'Performance', 'Security')
      .required()
      .messages({
        'any.only': 'Scenario Type must be one of the valid options',
        'any.required': 'Scenario Type is required'
      }),
    priority: Joi.string()
      .valid('High', 'Medium', 'Low', 'Critical')
      .required()
      .messages({
        'any.only': 'Priority must be one of: High, Medium, Low, Critical',
        'any.required': 'Priority is required'
      }),
    frequencyOfUse: Joi.string()
      .valid('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'On-Demand')
      .required()
      .messages({
        'any.only': 'Frequency of Use must be one of the valid options',
        'any.required': 'Frequency of Use is required'
      }),
    scenarioDescription: Joi.string()
      .required()
      .messages({
        'any.required': 'Scenario Description is required'
      }),
    preconditionsSetup: Joi.string()
      .optional(),
    stepNo: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': 'Step No must be a number',
        'number.integer': 'Step No must be an integer',
        'number.min': 'Step No must be at least 1',
        'any.required': 'Step No is required'
      }),
    action: Joi.string()
      .required()
      .messages({
        'any.required': 'Action is required'
      }),
    systemRole: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'System/Role must not exceed 100 characters'
      }),
    input: Joi.string()
      .optional(),
    expectedOutcome: Joi.string()
      .required()
      .messages({
        'any.required': 'Expected Outcome is required'
      }),
    testDataRequirements: Joi.string()
      .optional(),
    automated: Joi.boolean()
      .default(false),
    scriptId: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Script ID must not exceed 100 characters'
      }),
    dependencies: Joi.string()
      .optional(),
    scenarioStatus: Joi.string()
      .valid('Active', 'End-Dated', 'Draft', 'Under Review')
      .default('Active')
      .messages({
        'any.only': 'Scenario Status must be one of the valid options'
      }),
    endDate: Joi.date()
      .optional(),
    tags: Joi.array()
      .items(Joi.string())
      .default([]),
    estimatedDuration: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Estimated Duration must be a number',
        'number.integer': 'Estimated Duration must be an integer',
        'number.min': 'Estimated Duration must be at least 1 minute'
      }),
    riskLevel: Joi.string()
      .valid('Low', 'Medium', 'High', 'Critical')
      .default('Medium')
      .messages({
        'any.only': 'Risk Level must be one of: Low, Medium, High, Critical'
      })
  }),

  // Test plan validation
  testPlan: Joi.object({
    planName: Joi.string()
      .max(200)
      .required()
      .messages({
        'string.max': 'Plan Name must not exceed 200 characters',
        'any.required': 'Plan Name is required'
      }),
    testType: Joi.string()
      .valid('Schedule Releases', 'Regression Testing', 'UAT', 'SIT', 'CPU Testing', 'Desktop/Browser Compatibility Testing', 'Patch Testing', 'Security Testing')
      .required()
      .messages({
        'any.only': 'Test Type must be one of the valid options',
        'any.required': 'Test Type is required'
      }),
    objective: Joi.string()
      .required()
      .messages({
        'any.required': 'Objective is required'
      }),
    scope: Joi.string()
      .required()
      .messages({
        'any.required': 'Scope is required'
      }),
    startDate: Joi.date()
      .optional(),
    endDate: Joi.date()
      .optional(),
    estimatedDuration: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Estimated Duration must be a number',
        'number.integer': 'Estimated Duration must be an integer',
        'number.min': 'Estimated Duration must be at least 1 day'
      }),
    environment: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Environment must not exceed 100 characters'
      }),
    dataDependencies: Joi.string()
      .optional(),
    riskAssessment: Joi.string()
      .optional(),
    assumptions: Joi.string()
      .optional(),
    constraints: Joi.string()
      .optional(),
    successCriteria: Joi.string()
      .optional(),
    tags: Joi.array()
      .items(Joi.string())
      .default([]),
    isTemplate: Joi.boolean()
      .default(false),
    templateName: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Template Name must not exceed 100 characters'
      })
  }),

  // Test cycle validation
  testCycle: Joi.object({
    cycleName: Joi.string()
      .max(200)
      .required()
      .messages({
        'string.max': 'Cycle Name must not exceed 200 characters',
        'any.required': 'Cycle Name is required'
      }),
    testPlanId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Test Plan ID must be a valid UUID',
        'any.required': 'Test Plan ID is required'
      }),
    plannedStartDate: Joi.date()
      .required()
      .messages({
        'any.required': 'Planned Start Date is required'
      }),
    plannedEndDate: Joi.date()
      .greater(Joi.ref('plannedStartDate'))
      .required()
      .messages({
        'any.required': 'Planned End Date is required',
        'date.greater': 'Planned End Date must be after Planned Start Date'
      }),
    environment: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Environment must not exceed 100 characters'
      }),
    notes: Joi.string()
      .optional(),
    objectives: Joi.string()
      .optional(),
    successCriteria: Joi.string()
      .optional(),
    riskLevel: Joi.string()
      .valid('Low', 'Medium', 'High', 'Critical')
      .default('Medium')
      .messages({
        'any.only': 'Risk Level must be one of: Low, Medium, High, Critical'
      }),
    priority: Joi.string()
      .valid('Low', 'Medium', 'High', 'Critical')
      .default('Medium')
      .messages({
        'any.only': 'Priority must be one of: Low, Medium, High, Critical'
      }),
    estimatedEffort: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Estimated Effort must be a number',
        'number.integer': 'Estimated Effort must be an integer',
        'number.min': 'Estimated Effort must be at least 1 hour'
      })
  }),

  // Defect validation
  defect: Joi.object({
    title: Joi.string()
      .max(200)
      .required()
      .messages({
        'string.max': 'Title must not exceed 200 characters',
        'any.required': 'Title is required'
      }),
    description: Joi.string()
      .required()
      .messages({
        'any.required': 'Description is required'
      }),
    severity: Joi.string()
      .valid('Low', 'Medium', 'High', 'Critical', 'Blocker')
      .required()
      .messages({
        'any.only': 'Severity must be one of: Low, Medium, High, Critical, Blocker',
        'any.required': 'Severity is required'
      }),
    priority: Joi.string()
      .valid('Low', 'Medium', 'High', 'Critical')
      .required()
      .messages({
        'any.only': 'Priority must be one of: Low, Medium, High, Critical',
        'any.required': 'Priority is required'
      }),
    category: Joi.string()
      .valid('Functional', 'Non-Functional', 'UI/UX', 'Performance', 'Security', 'Integration', 'Data', 'Environment', 'Other')
      .required()
      .messages({
        'any.only': 'Category must be one of the valid options',
        'any.required': 'Category is required'
      }),
    stepsToReproduce: Joi.string()
      .required()
      .messages({
        'any.required': 'Steps to Reproduce is required'
      }),
    expectedBehavior: Joi.string()
      .required()
      .messages({
        'any.required': 'Expected Behavior is required'
      }),
    actualBehavior: Joi.string()
      .required()
      .messages({
        'any.required': 'Actual Behavior is required'
      }),
    testExecutionId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Test Execution ID must be a valid UUID'
      }),
    testScenarioId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Test Scenario ID must be a valid UUID'
      }),
    testCycleId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Test Cycle ID must be a valid UUID'
      }),
    moduleFeature: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Module/Feature must not exceed 100 characters'
      }),
    environment: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Environment must not exceed 100 characters'
      }),
    browser: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Browser must not exceed 50 characters'
      }),
    device: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Device must not exceed 100 characters'
      }),
    testData: Joi.string()
      .optional(),
    dueDate: Joi.date()
      .optional(),
    estimatedEffort: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Estimated Effort must be a number',
        'number.integer': 'Estimated Effort must be an integer',
        'number.min': 'Estimated Effort must be at least 1 hour'
      }),
    tags: Joi.array()
      .items(Joi.string())
      .default([]),
    version: Joi.string()
      .max(20)
      .optional()
      .messages({
        'string.max': 'Version must not exceed 20 characters'
      }),
    buildNumber: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Build Number must not exceed 50 characters'
      })
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

// Specific validation middleware
const validateRegistration = validate('registration');
const validateLogin = validate('login');
const validateTestScenario = validate('testScenario');
const validateTestPlan = validate('testPlan');
const validateTestCycle = validate('testCycle');
const validateDefect = validate('defect');

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateTestScenario,
  validateTestPlan,
  validateTestCycle,
  validateDefect,
  schemas
};
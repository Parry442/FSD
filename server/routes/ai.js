const express = require('express');
const OpenAI = require('openai');
const { 
  TestScenario, 
  TestPlan, 
  User, 
  sequelize 
} = require('../database');
const { 
  authenticateToken, 
  requireTestManager, 
  requireViewer 
} = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Auto Test Plan Generator
router.post('/generate-test-plan', authenticateToken, requireTestManager, async (req, res) => {
  try {
    const {
      testType,
      moduleFeatures,
      priorities,
      scenarioTypes,
      maxScenarios = 50,
      includeAutomated = true,
      riskBased = true,
      customFilters = {}
    } = req.body;

    if (!testType) {
      return res.status(400).json({ error: 'Test type is required' });
    }

    // Build where clause for scenario selection
    const whereClause = {
      scenarioStatus: 'Active'
    };

    if (moduleFeatures && moduleFeatures.length > 0) {
      whereClause.moduleFeature = { [sequelize.Op.in]: moduleFeatures };
    }

    if (priorities && priorities.length > 0) {
      whereClause.priority = { [sequelize.Op.in]: priorities };
    }

    if (scenarioTypes && scenarioTypes.length > 0) {
      whereClause.scenarioType = { [sequelize.Op.in]: scenarioTypes };
    }

    if (!includeAutomated) {
      whereClause.automated = false;
    }

    // Apply custom filters
    Object.assign(whereClause, customFilters);

    // Get eligible scenarios
    let scenarios = await TestScenario.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'scenarioOwner', attributes: ['username'] }
      ],
      order: [['priority', 'DESC'], ['riskLevel', 'DESC'], ['frequencyOfUse', 'DESC']]
    });

    // AI-powered scenario selection and optimization
    if (riskBased && scenarios.length > maxScenarios) {
      scenarios = await optimizeScenarioSelection(scenarios, maxScenarios, testType);
    }

    // Limit scenarios if needed
    if (scenarios.length > maxScenarios) {
      scenarios = scenarios.slice(0, maxScenarios);
    }

    // Generate test plan using AI
    const aiGeneratedContent = await generateTestPlanContent(testType, scenarios);

    // Create test plan
    const testPlan = await TestPlan.create({
      planName: aiGeneratedContent.planName,
      testType,
      objective: aiGeneratedContent.objective,
      scope: aiGeneratedContent.scope,
      status: 'Draft',
      createdBy: req.user.id,
      aiGenerated: true,
      aiRecommendations: aiGeneratedContent.recommendations,
      environment: aiGeneratedContent.environment,
      dataDependencies: aiGeneratedContent.dataDependencies,
      riskAssessment: aiGeneratedContent.riskAssessment,
      assumptions: aiGeneratedContent.assumptions,
      constraints: aiGeneratedContent.constraints,
      successCriteria: aiGeneratedContent.successCriteria,
      estimatedDuration: calculateEstimatedDuration(scenarios),
      tags: [testType, 'AI-Generated']
    });

    // Prepare response with selected scenarios
    const selectedScenarios = scenarios.map(scenario => ({
      id: scenario.id,
      scenarioId: scenario.scenarioId,
      title: scenario.title,
      moduleFeature: scenario.moduleFeature,
      priority: scenario.priority,
      riskLevel: scenario.riskLevel,
      estimatedDuration: scenario.estimatedDuration,
      automated: scenario.automated,
      owner: scenario.scenarioOwner?.username
    }));

    res.json({
      message: 'Test plan generated successfully',
      testPlan,
      selectedScenarios,
      totalScenarios: selectedScenarios.length,
      aiRecommendations: aiGeneratedContent.recommendations
    });

  } catch (error) {
    console.error('AI test plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate test plan' });
  }
});

// AI-powered scenario selection optimization
async function optimizeScenarioSelection(scenarios, maxScenarios, testType) {
  try {
    // Prepare scenario data for AI analysis
    const scenarioData = scenarios.map(scenario => ({
      id: scenario.id,
      title: scenario.title,
      priority: scenario.priority,
      riskLevel: scenario.riskLevel,
      frequencyOfUse: scenario.frequencyOfUse,
      moduleFeature: scenario.moduleFeature,
      scenarioType: scenario.scenarioType,
      automated: scenario.automated,
      estimatedDuration: scenario.estimatedDuration
    }));

    // Use OpenAI to analyze and rank scenarios
    const prompt = `
    Analyze the following test scenarios for a ${testType} test plan and select the ${maxScenarios} most important ones.
    
    Consider:
    - Priority (Critical > High > Medium > Low)
    - Risk level (Critical > High > Medium > Low)
    - Frequency of use (Daily > Weekly > Monthly > Quarterly > Yearly > On-Demand)
    - Module coverage (ensure good distribution across modules)
    - Automation status (mix of manual and automated)
    - Estimated duration (balance between quick and comprehensive tests)
    
    Test Scenarios:
    ${JSON.stringify(scenarioData, null, 2)}
    
    Return only a JSON array of scenario IDs in order of importance:
    [{"id": "uuid", "reason": "brief explanation"}]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    const selectedIds = aiResponse.map(item => item.id);

    // Return scenarios in AI-recommended order
    return scenarios.filter(scenario => selectedIds.includes(scenario.id))
      .sort((a, b) => {
        const aIndex = selectedIds.indexOf(a.id);
        const bIndex = selectedIds.indexOf(b.id);
        return aIndex - bIndex;
      });

  } catch (error) {
    console.error('AI optimization error:', error);
    // Fallback to priority-based selection
    return scenarios
      .sort((a, b) => {
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const riskOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        
        const aScore = priorityOrder[a.priority] + riskOrder[a.riskLevel];
        const bScore = priorityOrder[b.priority] + riskOrder[b.riskLevel];
        
        return bScore - aScore;
      })
      .slice(0, maxScenarios);
  }
}

// Generate test plan content using AI
async function generateTestPlanContent(testType, scenarios) {
  try {
    const moduleFeatures = [...new Set(scenarios.map(s => s.moduleFeature))];
    const totalDuration = scenarios.reduce((sum, s) => sum + (s.estimatedDuration || 30), 0);
    const automatedCount = scenarios.filter(s => s.automated).length;
    const manualCount = scenarios.length - automatedCount;

    const prompt = `
    Generate a comprehensive test plan for ${testType} testing with the following details:
    
    Test Type: ${testType}
    Total Scenarios: ${scenarios.length}
    Modules Covered: ${moduleFeatures.join(', ')}
    Estimated Duration: ${Math.ceil(totalDuration / 60)} hours
    Automated Scenarios: ${automatedCount}
    Manual Scenarios: ${manualCount}
    
    Please provide:
    1. A descriptive plan name
    2. Clear objective statement
    3. Comprehensive scope definition
    4. Environment requirements
    5. Data dependencies
    6. Risk assessment
    7. Key assumptions
    8. Potential constraints
    9. Success criteria
    10. AI recommendations for execution
    
    Format the response as JSON with these keys:
    {
      "planName": "string",
      "objective": "string",
      "scope": "string",
      "environment": "string",
      "dataDependencies": "string",
      "riskAssessment": "string",
      "assumptions": "string",
      "constraints": "string",
      "successCriteria": "string",
      "recommendations": "string"
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2000
    });

    return JSON.parse(completion.choices[0].message.content);

  } catch (error) {
    console.error('AI content generation error:', error);
    // Fallback to template-based content
    return generateFallbackContent(testType, scenarios);
  }
}

// Fallback content generation
function generateFallbackContent(testType, scenarios) {
  const moduleFeatures = [...new Set(scenarios.map(s => s.moduleFeature))];
  const totalDuration = scenarios.reduce((sum, s) => sum + (s.estimatedDuration || 30), 0);

  return {
    planName: `${testType} Test Plan - ${new Date().toLocaleDateString()}`,
    objective: `Execute comprehensive ${testType.toLowerCase()} testing across ${moduleFeatures.length} modules to ensure system quality and reliability.`,
    scope: `Testing covers ${scenarios.length} scenarios across ${moduleFeatures.join(', ')} modules with estimated duration of ${Math.ceil(totalDuration / 60)} hours.`,
    environment: 'Test environment matching production configuration',
    dataDependencies: 'Test data for all scenarios must be prepared and validated',
    riskAssessment: 'Medium risk level due to comprehensive coverage requirements',
    assumptions: 'All test environments are available and configured correctly',
    constraints: 'Limited time and resources may require prioritization of critical scenarios',
    successCriteria: 'All high-priority scenarios pass, 95% overall pass rate achieved',
    recommendations: 'Execute critical scenarios first, parallel execution where possible, daily status updates required'
  };
}

// Calculate estimated duration
function calculateEstimatedDuration(scenarios) {
  const totalMinutes = scenarios.reduce((sum, scenario) => {
    return sum + (scenario.estimatedDuration || 30); // Default 30 minutes
  }, 0);
  
  return Math.ceil(totalMinutes / 60); // Convert to hours
}

// AI-Driven Script Generation
router.post('/generate-script', authenticateToken, requireTestManager, async (req, res) => {
  try {
    const {
      testScenarioId,
      framework = 'Selenium',
      language = 'Python',
      includeComments = true,
      includeAssertions = true,
      testDataContext = true
    } = req.body;

    if (!testScenarioId) {
      return res.status(400).json({ error: 'Test scenario ID is required' });
    }

    // Get test scenario details
    const scenario = await TestScenario.findByPk(testScenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Test scenario not found' });
    }

    // Generate automation script using AI
    const script = await generateAutomationScript(scenario, framework, language, {
      includeComments,
      includeAssertions,
      testDataContext
    });

    res.json({
      message: 'Automation script generated successfully',
      script: {
        id: uuidv4(),
        framework,
        language,
        content: script.content,
        metadata: script.metadata,
        recommendations: script.recommendations
      }
    });

  } catch (error) {
    console.error('AI script generation error:', error);
    res.status(500).json({ error: 'Failed to generate automation script' });
  }
});

// Generate automation script using AI
async function generateAutomationScript(scenario, framework, language, options) {
  try {
    const prompt = `
    Generate a ${framework} automation script in ${language} for the following test scenario:
    
    Title: ${scenario.title}
    Description: ${scenario.scenarioDescription}
    Preconditions: ${scenario.preconditionsSetup || 'None specified'}
    Action: ${scenario.action}
    Expected Outcome: ${scenario.expectedOutcome}
    Test Data: ${scenario.testDataRequirements || 'Standard test data'}
    
    Requirements:
    - Framework: ${framework}
    - Language: ${language}
    - Include comments: ${options.includeComments}
    - Include assertions: ${options.includeAssertions}
    - Include test data context: ${options.testDataContext}
    
    Generate a complete, executable script with:
    1. Proper imports and setup
    2. Test data preparation
    3. Step-by-step execution
    4. Assertions and validations
    5. Error handling
    6. Cleanup procedures
    
    Return the response as JSON with:
    {
      "content": "the complete script code",
      "metadata": {
        "framework": "framework used",
        "language": "language used",
        "estimatedExecutionTime": "estimated time in minutes",
        "dependencies": ["list of required packages/libraries"],
        "setupInstructions": "setup steps"
      },
      "recommendations": [
        "list of improvement suggestions"
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 3000
    });

    return JSON.parse(completion.choices[0].message.content);

  } catch (error) {
    console.error('AI script generation error:', error);
    // Fallback to template-based script
    return generateFallbackScript(scenario, framework, language, options);
  }
}

// Fallback script generation
function generateFallbackScript(scenario, framework, language, options) {
  const template = `
# ${scenario.title}
# Generated for ${framework} in ${language}
# Test Scenario ID: ${scenario.scenarioId}

${options.includeComments ? `"""
Test Description: ${scenario.scenarioDescription}
Preconditions: ${scenario.preconditionsSetup || 'None specified'}
Expected Outcome: ${scenario.expectedOutcome}
"""` : ''}

# TODO: Implement automation script based on the scenario requirements
# This is a template that needs to be customized for your specific application

def test_${scenario.scenarioId.toLowerCase().replace(/[^a-z0-9]/g, '_')}():
    """
    Test: ${scenario.title}
    """
    # Setup
    # TODO: Add setup code here
    
    # Execute test steps
    # TODO: Implement the action: ${scenario.action}
    
    # Verify results
    # TODO: Add assertions for: ${scenario.expectedOutcome}
    
    # Cleanup
    # TODO: Add cleanup code here

if __name__ == "__main__":
    test_${scenario.scenarioId.toLowerCase().replace(/[^a-z0-9]/g, '_')}()
`;

  return {
    content: template,
    metadata: {
      framework,
      language,
      estimatedExecutionTime: "15-30 minutes",
      dependencies: ["Basic testing framework"],
      setupInstructions: "Customize template according to your application and testing framework"
    },
    recommendations: [
      "Customize the script for your specific application",
      "Add proper error handling and logging",
      "Include data-driven testing capabilities",
      "Add reporting and screenshot capture",
      "Implement retry mechanisms for flaky tests"
    ]
  };
}

// Get AI recommendations for test scenarios
router.get('/recommendations/scenarios', authenticateToken, requireViewer, async (req, res) => {
  try {
    const { moduleFeature, scenarioType, priority } = req.query;

    // Get scenarios for analysis
    const whereClause = { scenarioStatus: 'Active' };
    if (moduleFeature) whereClause.moduleFeature = moduleFeature;
    if (scenarioType) whereClause.scenarioType = scenarioType;
    if (priority) whereClause.priority = priority;

    const scenarios = await TestScenario.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'scenarioOwner', attributes: ['username'] }
      ],
      limit: 100
    });

    // Generate AI recommendations
    const recommendations = await generateScenarioRecommendations(scenarios);

    res.json({
      recommendations,
      analyzedScenarios: scenarios.length
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Generate scenario recommendations using AI
async function generateScenarioRecommendations(scenarios) {
  try {
    const prompt = `
    Analyze the following test scenarios and provide recommendations for:
    1. High-risk scenarios that need immediate attention
    2. Outdated or underused scenarios
    3. Gaps in test coverage
    4. Optimization opportunities
    5. Automation priorities
    
    Test Scenarios:
    ${JSON.stringify(scenarios.map(s => ({
      id: s.id,
      title: s.title,
      priority: s.priority,
      riskLevel: s.riskLevel,
      lastUpdated: s.lastUpdated,
      automated: s.automated,
      moduleFeature: s.moduleFeature
    })), null, 2)}
    
    Provide recommendations in JSON format:
    {
      "highRiskScenarios": ["list of scenario IDs that need attention"],
      "outdatedScenarios": ["list of scenario IDs that may be outdated"],
      "coverageGaps": ["description of potential gaps"],
      "optimizationOpportunities": ["list of optimization suggestions"],
      "automationPriorities": ["list of scenarios to prioritize for automation"]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    return JSON.parse(completion.choices[0].message.content);

  } catch (error) {
    console.error('AI recommendations error:', error);
    return {
      highRiskScenarios: [],
      outdatedScenarios: [],
      coverageGaps: "Unable to analyze coverage gaps at this time",
      optimizationOpportunities: ["Review and update test scenarios regularly"],
      automationPriorities: ["Prioritize high-frequency, low-complexity scenarios for automation"]
    };
  }
}

// Get AI insights for test execution
router.get('/insights/execution', authenticateToken, requireViewer, async (req, res) => {
  try {
    const { testCycleId, testPlanId } = req.query;

    if (!testCycleId && !testPlanId) {
      return res.status(400).json({ error: 'Either testCycleId or testPlanId is required' });
    }

    // Get execution data for analysis
    const executionData = await getExecutionData(testCycleId, testPlanId);
    
    // Generate AI insights
    const insights = await generateExecutionInsights(executionData);

    res.json({
      insights,
      dataAnalyzed: executionData.length
    });

  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Get execution data for analysis
async function getExecutionData(testCycleId, testPlanId) {
  // This would fetch actual execution data from your database
  // For now, return sample data structure
  return [
    {
      scenarioId: "TS001",
      status: "Passed",
      duration: 15,
      defects: 0,
      retestCount: 0
    }
  ];
}

// Generate execution insights using AI
async function generateExecutionInsights(executionData) {
  try {
    const prompt = `
    Analyze the following test execution data and provide insights on:
    1. Execution patterns and trends
    2. Performance bottlenecks
    3. Quality indicators
    4. Improvement recommendations
    5. Risk areas
    
    Execution Data:
    ${JSON.stringify(executionData, null, 2)}
    
    Provide insights in JSON format:
    {
      "patterns": ["list of observed patterns"],
      "bottlenecks": ["list of performance bottlenecks"],
      "qualityIndicators": ["list of quality metrics and indicators"],
      "improvements": ["list of improvement recommendations"],
      "riskAreas": ["list of identified risk areas"]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    return JSON.parse(completion.choices[0].message.content);

  } catch (error) {
    console.error('AI insights error:', error);
    return {
      patterns: ["Unable to analyze patterns at this time"],
      bottlenecks: ["Data analysis required to identify bottlenecks"],
      qualityIndicators: ["Pass rate, defect rate, execution time"],
      improvements: ["Regular review of execution data and patterns"],
      riskAreas: ["Areas with high failure rates or long execution times"]
    };
  }
}

module.exports = router;
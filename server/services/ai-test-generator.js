const AWS = require('aws-sdk');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class AITestGenerator {
  constructor() {
    this.bedrock = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
  }

  // Generate API tests from OpenAPI specification
  async generateAPITests(openApiSpec, testType = 'functional') {
    const prompt = this.buildAPITestPrompt(openApiSpec, testType);
    
    try {
      const response = await this.invokeBedrock(prompt);
      return this.parseTestResponse(response);
    } catch (error) {
      console.error('AI API test generation failed:', error);
      throw error;
    }
  }

  // Generate data quality tests from schema
  async generateDataQualityTests(schema, dataSource) {
    const prompt = this.buildDataQualityPrompt(schema, dataSource);
    
    try {
      const response = await this.invokeBedrock(prompt);
      return this.parseTestResponse(response);
    } catch (error) {
      console.error('AI data quality test generation failed:', error);
      throw error;
    }
  }

  // Generate ML model tests for drift detection
  async generateMLModelTests(modelMetadata, trainingData) {
    const prompt = this.buildMLModelPrompt(modelMetadata, trainingData);
    
    try {
      const response = await this.invokeBedrock(prompt);
      return this.parseTestResponse(response);
    } catch (error) {
      console.error('AI ML model test generation failed:', error);
      throw error;
    }
  }

  // Generate UI/E2E tests from user stories
  async generateUITests(userStories, applicationType) {
    const prompt = this.buildUITestPrompt(userStories, applicationType);
    
    try {
      const response = await this.invokeBedrock(prompt);
      return this.parseTestResponse(response);
    } catch (error) {
      console.error('AI UI test generation failed:', error);
      throw error;
    }
  }

  // Smart regression test selection based on code changes
  async selectRegressionTests(codeChanges, testHistory) {
    const prompt = this.buildRegressionSelectionPrompt(codeChanges, testHistory);
    
    try {
      const response = await this.invokeBedrock(prompt);
      return this.parseTestResponse(response);
    } catch (error) {
      console.error('AI regression test selection failed:', error);
      throw error;
    }
  }

  // Anomaly detection in test results
  async detectTestAnomalies(testResults, historicalData) {
    const prompt = this.buildAnomalyDetectionPrompt(testResults, historicalData);
    
    try {
      const response = await this.invokeBedrock(prompt);
      return this.parseTestResponse(response);
    } catch (error) {
      console.error('AI anomaly detection failed:', error);
      throw error;
    }
  }

  // Private methods for building prompts
  buildAPITestPrompt(openApiSpec, testType) {
    return `You are an expert QA engineer. Generate comprehensive ${testType} tests for the following API specification:

${JSON.stringify(openApiSpec, null, 2)}

Generate tests in the following format:
1. Test case name
2. Test description
3. Test steps
4. Expected results
5. Test data requirements
6. Priority level (High/Medium/Low)

Focus on:
- Edge cases
- Error scenarios
- Performance boundaries
- Security considerations
- Data validation

Return the response as valid JSON with the structure:
{
  "testCases": [
    {
      "name": "string",
      "description": "string",
      "steps": ["string"],
      "expectedResults": ["string"],
      "testData": {},
      "priority": "string"
    }
  ]
}`;
  }

  buildDataQualityPrompt(schema, dataSource) {
    return `You are a data quality expert. Generate comprehensive data quality tests for the following schema and data source:

Schema: ${JSON.stringify(schema, null, 2)}
Data Source: ${dataSource}

Generate tests covering:
1. Completeness (null checks)
2. Accuracy (data validation)
3. Consistency (cross-field validation)
4. Timeliness (freshness checks)
5. Validity (format validation)
6. Uniqueness (duplicate detection)

Return the response as valid JSON with the structure:
{
  "dataQualityTests": [
    {
      "testName": "string",
      "testType": "string",
      "description": "string",
      "sqlQuery": "string",
      "expectedResult": "string",
      "threshold": "number"
    }
  ]
}`;
  }

  buildMLModelPrompt(modelMetadata, trainingData) {
    return `You are an ML testing expert. Generate comprehensive tests for the following ML model:

Model Metadata: ${JSON.stringify(modelMetadata, null, 2)}
Training Data Summary: ${JSON.stringify(trainingData, null, 2)}

Generate tests covering:
1. Model drift detection
2. Data quality validation
3. Feature importance monitoring
4. Prediction accuracy
5. Fairness metrics
6. Performance degradation

Return the response as valid JSON with the structure:
{
  "mlModelTests": [
    {
      "testName": "string",
      "testType": "string",
      "description": "string",
      "metrics": ["string"],
      "thresholds": {},
      "monitoringFrequency": "string"
    }
  ]
}`;
  }

  buildUITestPrompt(userStories, applicationType) {
    return `You are a UI testing expert. Generate comprehensive E2E tests for the following user stories:

User Stories: ${JSON.stringify(userStories, null, 2)}
Application Type: ${applicationType}

Generate tests covering:
1. User journey flows
2. Cross-browser compatibility
3. Responsive design
4. Accessibility
5. Performance
6. Error handling

Return the response as valid JSON with the structure:
{
  "uiTests": [
    {
      "testName": "string",
      "userStory": "string",
      "testSteps": ["string"],
      "selectors": {},
      "expectedResults": ["string"],
      "browsers": ["string"]
    }
  ]
}`;
  }

  buildRegressionSelectionPrompt(codeChanges, testHistory) {
    return `You are a test automation expert. Analyze the following code changes and test history to select the most relevant regression tests:

Code Changes: ${JSON.stringify(codeChanges, null, 2)}
Test History: ${JSON.stringify(testHistory, null, 2)}

Select tests based on:
1. Code coverage of changed areas
2. Historical failure patterns
3. Business criticality
4. Test execution time
5. Dependencies

Return the response as valid JSON with the structure:
{
  "selectedTests": [
    {
      "testId": "string",
      "reason": "string",
      "priority": "string",
      "estimatedTime": "string"
    }
  ]
}`;
  }

  buildAnomalyDetectionPrompt(testResults, historicalData) {
    return `You are a test analytics expert. Analyze the following test results for anomalies:

Test Results: ${JSON.stringify(testResults, null, 2)}
Historical Data: ${JSON.stringify(historicalData, null, 2)}

Identify:
1. Performance degradation
2. Unusual failure patterns
3. Test execution time spikes
4. Resource utilization anomalies
5. Correlation patterns

Return the response as valid JSON with the structure:
{
  "anomalies": [
    {
      "type": "string",
      "severity": "string",
      "description": "string",
      "recommendations": ["string"]
    }
  ]
}`;
  }

  // Invoke AWS Bedrock
  async invokeBedrock(prompt) {
    const input = {
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.bedrock.send(command);
      
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text;
    } catch (error) {
      console.error('Bedrock invocation failed:', error);
      throw error;
    }
  }

  // Parse AI response
  parseTestResponse(response) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return raw response
      return { rawResponse: response };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return { rawResponse: response, parseError: error.message };
    }
  }
}

module.exports = { AITestGenerator };
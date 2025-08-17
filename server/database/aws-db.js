const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class AwsDatabase {
  constructor() {
    // Initialize AWS SDK
    this.dynamodb = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    
    this.tableName = process.env.DYNAMODB_TABLE || 'testing-suite';
    this.bucketName = process.env.S3_BUCKET || 'testing-suite-logs';
  }

  // Generic CRUD operations for DynamoDB
  async create(collection, data) {
    const item = {
      id: uuidv4(),
      collection,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: this.tableName,
      Item: item
    };

    try {
      await this.dynamodb.put(params).promise();
      return item;
    } catch (error) {
      console.error('DynamoDB create error:', error);
      throw error;
    }
  }

  async findById(collection, id) {
    const params = {
      TableName: this.tableName,
      Key: { id, collection }
    };

    try {
      const result = await this.dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('DynamoDB findById error:', error);
      throw error;
    }
  }

  async find(collection, query = {}) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'collection = :collection',
      ExpressionAttributeValues: {
        ':collection': collection
      }
    };

    // Add filter expressions for additional query parameters
    if (Object.keys(query).length > 0) {
      let filterExpressions = [];
      let expressionAttributeNames = {};
      let expressionAttributeValues = {};

      Object.keys(query).forEach((key, index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:value${index}`;
        
        filterExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = query[key];
      });

      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = { ...params.ExpressionAttributeValues, ...expressionAttributeValues };
    }

    try {
      const result = await this.dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error('DynamoDB find error:', error);
      throw error;
    }
  }

  async update(collection, id, data) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(data).forEach((key, index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:value${index}`;
      
      updateExpression.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = data[key];
    });

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: this.tableName,
      Key: { id, collection },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await this.dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('DynamoDB update error:', error);
      throw error;
    }
  }

  async delete(collection, id) {
    const params = {
      TableName: this.tableName,
      Key: { id, collection }
    };

    try {
      await this.dynamodb.delete(params).promise();
      return { success: true };
    } catch (error) {
      console.error('DynamoDB delete error:', error);
      throw error;
    }
  }

  async count(collection) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'collection = :collection',
      ExpressionAttributeValues: {
        ':collection': collection
      },
      Select: 'COUNT'
    };

    try {
      const result = await this.dynamodb.query(params).promise();
      return result.Count;
    } catch (error) {
      console.error('DynamoDB count error:', error);
      throw error;
    }
  }

  // S3 operations for file storage (test artifacts, logs, etc.)
  async uploadFile(key, data, contentType = 'application/json') {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: typeof data === 'string' ? data : JSON.stringify(data),
      ContentType: contentType
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }

  async downloadFile(key) {
    const params = {
      Bucket: this.bucketName,
      Key: key
    };

    try {
      const result = await this.s3.getObject(params).promise();
      return result.Body.toString();
    } catch (error) {
      console.error('S3 download error:', error);
      throw error;
    }
  }

  async listFiles(prefix = '') {
    const params = {
      Bucket: this.bucketName,
      Prefix: prefix
    };

    try {
      const result = await this.s3.listObjectsV2(params).promise();
      return result.Contents.map(item => item.Key);
    } catch (error) {
      console.error('S3 list error:', error);
      throw error;
    }
  }

  // Initialize DynamoDB table (run once during setup)
  async initializeTable() {
    const dynamodb = new AWS.DynamoDB({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const params = {
      TableName: this.tableName,
      KeySchema: [
        { AttributeName: 'collection', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'collection', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    try {
      await dynamodb.createTable(params).promise();
      console.log('✅ DynamoDB table created successfully');
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log('ℹ️ DynamoDB table already exists');
      } else {
        console.error('❌ DynamoDB table creation failed:', error);
        throw error;
      }
    }
  }
}

module.exports = { AwsDatabase };
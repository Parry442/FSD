const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { 
  TestScenario, 
  User, 
  sequelize 
} = require('../database');
const { 
  authenticateToken, 
  requireTestManager, 
  requireViewer,
  requireOwnership 
} = require('../middleware/auth');
const { validateTestScenario } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/scenarios');
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Get all test scenarios with filtering and pagination
router.get('/', authenticateToken, requireViewer, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      moduleFeature,
      scenarioType,
      priority,
      status,
      owner,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search functionality
    if (search) {
      whereClause[sequelize.Op.or] = [
        { title: { [sequelize.Op.iLike]: `%${search}%` } },
        { scenarioId: { [sequelize.Op.iLike]: `%${search}%` } },
        { scenarioDescription: { [sequelize.Op.iLike]: `%${search}%` } },
        { moduleFeature: { [sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by module/feature
    if (moduleFeature) {
      whereClause.moduleFeature = moduleFeature;
    }

    // Filter by scenario type
    if (scenarioType) {
      whereClause.scenarioType = scenarioType;
    }

    // Filter by priority
    if (priority) {
      whereClause.priority = priority;
    }

    // Filter by status
    if (status) {
      whereClause.scenarioStatus = status;
    }

    // Filter by owner
    if (owner) {
      whereClause.owner = owner;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      whereClause.tags = { [sequelize.Op.overlap]: tagArray };
    }

    // Build order clause
    const orderClause = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: scenarios } = await TestScenario.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'scenarioOwner', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: User, as: 'reviewer', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      scenarios,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Fetch scenarios error:', error);
    res.status(500).json({ error: 'Failed to fetch test scenarios' });
  }
});

// Get test scenario by ID
router.get('/:id', authenticateToken, requireViewer, async (req, res) => {
  try {
    const { id } = req.params;

    const scenario = await TestScenario.findByPk(id, {
      include: [
        { model: User, as: 'scenarioOwner', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: User, as: 'reviewer', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    if (!scenario) {
      return res.status(404).json({ error: 'Test scenario not found' });
    }

    res.json({ scenario });
  } catch (error) {
    console.error('Fetch scenario error:', error);
    res.status(500).json({ error: 'Failed to fetch test scenario' });
  }
});

// Create new test scenario
router.post('/', authenticateToken, requireTestManager, validateTestScenario, async (req, res) => {
  try {
    const scenarioData = {
      ...req.body,
      owner: req.user.id,
      lastUpdated: new Date()
    };

    const scenario = await TestScenario.create(scenarioData);

    const createdScenario = await TestScenario.findByPk(scenario.id, {
      include: [
        { model: User, as: 'scenarioOwner', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    res.status(201).json({
      message: 'Test scenario created successfully',
      scenario: createdScenario
    });
  } catch (error) {
    console.error('Create scenario error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Scenario ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create test scenario' });
  }
});

// Update test scenario
router.put('/:id', authenticateToken, requireTestManager, validateTestScenario, async (req, res) => {
  try {
    const { id } = req.params;
    const scenario = await TestScenario.findByPk(id);

    if (!scenario) {
      return res.status(404).json({ error: 'Test scenario not found' });
    }

    // Check if scenario can be modified
    if (scenario.scenarioStatus === 'End-Dated' && req.body.scenarioStatus !== 'Active') {
      return res.status(400).json({ error: 'End-dated scenarios cannot be modified' });
    }

    // Increment version if significant changes are made
    const significantFields = ['title', 'scenarioDescription', 'action', 'expectedOutcome'];
    const hasSignificantChanges = significantFields.some(field => 
      req.body[field] && req.body[field] !== scenario[field]
    );

    if (hasSignificantChanges) {
      req.body.version = scenario.version + 1;
      req.body.lastUpdated = new Date();
      req.body.reviewedBy = req.user.id;
      req.body.reviewDate = new Date();
    }

    await scenario.update(req.body);

    const updatedScenario = await TestScenario.findByPk(id, {
      include: [
        { model: User, as: 'scenarioOwner', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: User, as: 'reviewer', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    res.json({
      message: 'Test scenario updated successfully',
      scenario: updatedScenario
    });
  } catch (error) {
    console.error('Update scenario error:', error);
    res.status(500).json({ error: 'Failed to update test scenario' });
  }
});

// Delete test scenario (soft delete by setting status to End-Dated)
router.delete('/:id', authenticateToken, requireTestManager, async (req, res) => {
  try {
    const { id } = req.params;
    const scenario = await TestScenario.findByPk(id);

    if (!scenario) {
      return res.status(404).json({ error: 'Test scenario not found' });
    }

    // Set end date instead of hard delete
    await scenario.update({
      scenarioStatus: 'End-Dated',
      endDate: new Date(),
      lastUpdated: new Date()
    });

    res.json({ message: 'Test scenario end-dated successfully' });
  } catch (error) {
    console.error('Delete scenario error:', error);
    res.status(500).json({ error: 'Failed to end-date test scenario' });
  }
});

// Import test scenarios from Excel file
router.post('/import', authenticateToken, requireTestManager, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: []
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because Excel is 1-indexed and we have headers

      try {
        // Map Excel columns to model fields
        const scenarioData = {
          scenarioId: row['Scenario ID'] || row['scenarioId'],
          title: row['Title'] || row['title'],
          moduleFeature: row['Module/Feature'] || row['moduleFeature'],
          businessProcess: row['Business Process'] || row['businessProcess'],
          scenarioType: row['Scenario Type'] || row['scenarioType'],
          priority: row['Priority'] || row['priority'],
          frequencyOfUse: row['Frequency of Use'] || row['frequencyOfUse'],
          scenarioDescription: row['Scenario Description'] || row['scenarioDescription'],
          preconditionsSetup: row['Preconditions / Setup'] || row['preconditionsSetup'],
          stepNo: parseInt(row['Step No'] || row['stepNo']) || 1,
          action: row['Action'] || row['action'],
          systemRole: row['System/Role'] || row['systemRole'],
          input: row['Input'] || row['input'],
          expectedOutcome: row['Expected Outcome'] || row['expectedOutcome'],
          testDataRequirements: row['Test Data Requirements'] || row['testDataRequirements'],
          automated: row['Automated'] === 'Yes' || row['automated'] === true,
          scriptId: row['Script ID'] || row['scriptId'],
          dependencies: row['Dependencies'] || row['dependencies'],
          tags: row['Tags'] ? row['Tags'].split(',').map(tag => tag.trim()) : [],
          owner: req.user.id,
          lastUpdated: new Date()
        };

        // Validate required fields
        if (!scenarioData.scenarioId || !scenarioData.title || !scenarioData.moduleFeature) {
          results.errors.push({
            row: rowNumber,
            error: 'Missing required fields: Scenario ID, Title, or Module/Feature'
          });
          continue;
        }

        // Check if scenario exists
        const existingScenario = await TestScenario.findOne({
          where: { scenarioId: scenarioData.scenarioId }
        });

        if (existingScenario) {
          // Update existing scenario
          await existingScenario.update(scenarioData);
          results.updated++;
        } else {
          // Create new scenario
          await TestScenario.create(scenarioData);
          results.imported++;
        }
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import test scenarios' });
  }
});

// Export test scenarios to Excel
router.get('/export/excel', authenticateToken, requireViewer, async (req, res) => {
  try {
    const { 
      moduleFeature, 
      scenarioType, 
      priority, 
      status,
      includeInactive = false 
    } = req.query;

    const whereClause = {};

    if (moduleFeature) whereClause.moduleFeature = moduleFeature;
    if (scenarioType) whereClause.scenarioType = scenarioType;
    if (priority) whereClause.priority = priority;
    if (status) whereClause.scenarioStatus = status;

    // Filter out end-dated scenarios unless specifically requested
    if (!includeInactive) {
      whereClause.scenarioStatus = { [sequelize.Op.ne]: 'End-Dated' };
    }

    const scenarios = await TestScenario.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'scenarioOwner', attributes: ['username'] }
      ],
      order: [['moduleFeature', 'ASC'], ['scenarioId', 'ASC']]
    });

    // Prepare data for Excel
    const excelData = scenarios.map(scenario => ({
      'Scenario ID': scenario.scenarioId,
      'Title': scenario.title,
      'Module/Feature': scenario.moduleFeature,
      'Business Process': scenario.businessProcess || '',
      'Scenario Type': scenario.scenarioType,
      'Priority': scenario.priority,
      'Frequency of Use': scenario.frequencyOfUse,
      'Owner': scenario.scenarioOwner?.username || '',
      'Scenario Description': scenario.scenarioDescription,
      'Preconditions / Setup': scenario.preconditionsSetup || '',
      'Step No': scenario.stepNo,
      'Action': scenario.action,
      'System/Role': scenario.systemRole || '',
      'Input': scenario.input || '',
      'Expected Outcome': scenario.expectedOutcome,
      'Test Data Requirements': scenario.testDataRequirements || '',
      'Automated': scenario.automated ? 'Yes' : 'No',
      'Script ID': scenario.scriptId || '',
      'Dependencies': scenario.dependencies || '',
      'Scenario Status': scenario.scenarioStatus,
      'Last Updated': scenario.lastUpdated,
      'Reviewed By': scenario.reviewedBy || '',
      'Version': scenario.version,
      'Tags': scenario.tags.join(', '),
      'Estimated Duration': scenario.estimatedDuration || '',
      'Risk Level': scenario.riskLevel
    }));

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Scenario ID
      { wch: 30 }, // Title
      { wch: 20 }, // Module/Feature
      { wch: 25 }, // Business Process
      { wch: 20 }, // Scenario Type
      { wch: 10 }, // Priority
      { wch: 20 }, // Frequency of Use
      { wch: 15 }, // Owner
      { wch: 40 }, // Scenario Description
      { wch: 30 }, // Preconditions
      { wch: 10 }, // Step No
      { wch: 30 }, // Action
      { wch: 15 }, // System/Role
      { wch: 20 }, // Input
      { wch: 30 }, // Expected Outcome
      { wch: 25 }, // Test Data Requirements
      { wch: 10 }, // Automated
      { wch: 15 }, // Script ID
      { wch: 20 }, // Dependencies
      { wch: 15 }, // Status
      { wch: 20 }, // Last Updated
      { wch: 15 }, // Reviewed By
      { wch: 10 }, // Version
      { wch: 20 }, // Tags
      { wch: 20 }, // Estimated Duration
      { wch: 15 }  // Risk Level
    ];

    worksheet['!cols'] = columnWidths;

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Test Scenarios');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `test-scenarios-${timestamp}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to buffer and send
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export test scenarios' });
  }
});

// Get scenario version history
router.get('/:id/versions', authenticateToken, requireViewer, async (req, res) => {
  try {
    const { id } = req.params;

    const scenario = await TestScenario.findByPk(id);
    if (!scenario) {
      return res.status(404).json({ error: 'Test scenario not found' });
    }

    // For now, return current version info
    // In a full implementation, you'd have a separate versions table
    res.json({
      currentVersion: {
        version: scenario.version,
        lastUpdated: scenario.lastUpdated,
        reviewedBy: scenario.reviewedBy,
        reviewDate: scenario.reviewDate
      },
      message: 'Version history feature coming soon'
    });
  } catch (error) {
    console.error('Version history error:', error);
    res.status(500).json({ error: 'Failed to fetch version history' });
  }
});

// Bulk update scenarios
router.put('/bulk/update', authenticateToken, requireTestManager, async (req, res) => {
  try {
    const { scenarioIds, updates } = req.body;

    if (!scenarioIds || !Array.isArray(scenarioIds) || scenarioIds.length === 0) {
      return res.status(400).json({ error: 'Scenario IDs array is required' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Updates object is required' });
    }

    const results = await TestScenario.update(
      { ...updates, lastUpdated: new Date() },
      {
        where: {
          id: { [sequelize.Op.in]: scenarioIds }
        }
      }
    );

    res.json({
      message: 'Bulk update completed successfully',
      updatedCount: results[0]
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
});

// Get scenario statistics
router.get('/stats/overview', authenticateToken, requireViewer, async (req, res) => {
  try {
    const totalScenarios = await TestScenario.count();
    const activeScenarios = await TestScenario.count({ where: { scenarioStatus: 'Active' } });
    const endDatedScenarios = await TestScenario.count({ where: { scenarioStatus: 'End-Dated' } });
    const automatedScenarios = await TestScenario.count({ where: { automated: true } });

    const moduleStats = await TestScenario.findAll({
      attributes: [
        'moduleFeature',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['moduleFeature'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });

    const typeStats = await TestScenario.findAll({
      attributes: [
        'scenarioType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['scenarioType'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    const priorityStats = await TestScenario.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    res.json({
      overview: {
        total: totalScenarios,
        active: activeScenarios,
        endDated: endDatedScenarios,
        automated: automatedScenarios
      },
      moduleStats,
      typeStats,
      priorityStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch scenario statistics' });
  }
});

module.exports = router;
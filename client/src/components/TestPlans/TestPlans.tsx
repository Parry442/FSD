import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  ListItemButton,
  ListItemIcon,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AutoAwesome as AutoIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface TestPlan {
  id: string;
  name: string;
  description: string;
  objective: string;
  scope: string;
  testType: string;
  status: string;
  createdBy: string;
  createdAt: string;
  approvedBy: string;
  approvedAt: string;
  scenarios: TestScenario[];
  environments: string[];
  dataDependencies: string[];
  estimatedDuration: number;
  riskLevel: string;
}

interface TestScenario {
  id: string;
  scenarioId: string;
  title: string;
  moduleFeature: string;
  priority: string;
  estimatedDuration: number;
  automated: boolean;
}

const TestPlans: React.FC = () => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAutoGenerator, setOpenAutoGenerator] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    testType: '',
    status: '',
    createdBy: '',
    riskLevel: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  // Auto-generator state
  const [autoGeneratorStep, setAutoGeneratorStep] = useState(0);
  const [autoGeneratorConfig, setAutoGeneratorConfig] = useState({
    testType: '',
    modules: [] as string[],
    priorities: [] as string[],
    includeAutomated: true,
    includeManual: true,
    maxDuration: 0,
    riskTolerance: 'Medium'
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objective: '',
    scope: '',
    testType: '',
    environments: [] as string[],
    dataDependencies: [] as string[],
    estimatedDuration: 0,
    riskLevel: 'Medium'
  });

  useEffect(() => {
    fetchTestPlans();
    fetchScenarios();
  }, [page, filters]);

  const fetchTestPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.testType && { testType: filters.testType }),
        ...(filters.status && { status: filters.status }),
        ...(filters.createdBy && { createdBy: filters.createdBy }),
        ...(filters.riskLevel && { riskLevel: filters.riskLevel })
      });

      const response = await axios.get(`/api/test-plans?${params}`);
      setTestPlans(response.data.testPlans);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (error) {
      enqueueSnackbar('Failed to fetch test plans', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await axios.get('/api/test-scenarios?limit=1000&status=Active');
      setScenarios(response.data.scenarios);
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedPlan) {
        await axios.put(`/api/test-plans/${selectedPlan.id}`, formData);
        enqueueSnackbar('Test plan updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/test-plans', formData);
        enqueueSnackbar('Test plan created successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      resetForm();
      fetchTestPlans();
    } catch (error) {
      enqueueSnackbar('Failed to save test plan', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test plan?')) {
      try {
        await axios.delete(`/api/test-plans/${id}`);
        enqueueSnackbar('Test plan deleted successfully', { variant: 'success' });
        fetchTestPlans();
      } catch (error) {
        enqueueSnackbar('Failed to delete test plan', { variant: 'error' });
      }
    }
  };

  const handleEdit = (plan: TestPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      objective: plan.objective,
      scope: plan.scope,
      testType: plan.testType,
      environments: plan.environments || [],
      dataDependencies: plan.dataDependencies || [],
      estimatedDuration: plan.estimatedDuration || 0,
      riskLevel: plan.riskLevel || 'Medium'
    });
    setOpenDialog(true);
  };

  const handleAutoGenerate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/test-plans/auto-generate', autoGeneratorConfig);
      enqueueSnackbar('Test plan generated successfully', { variant: 'success' });
      setOpenAutoGenerator(false);
      fetchTestPlans();
    } catch (error) {
      enqueueSnackbar('Failed to generate test plan', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      objective: '',
      scope: '',
      testType: '',
      environments: [],
      dataDependencies: [],
      estimatedDuration: 0,
      riskLevel: 'Medium'
    });
    setSelectedPlan(null);
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'Regression': return 'error';
      case 'UAT': return 'warning';
      case 'SIT': return 'info';
      case 'Performance': return 'secondary';
      case 'Security': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'warning';
      case 'Under Review': return 'info';
      case 'Approved': return 'success';
      case 'In Progress': return 'primary';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const autoGeneratorSteps = [
    {
      label: 'Test Type Selection',
      description: 'Choose the type of testing and basic configuration'
    },
    {
      label: 'Scenario Filtering',
      description: 'Select modules, priorities, and other criteria'
    },
    {
      label: 'AI Optimization',
      description: 'AI will analyze and optimize the selection'
    },
    {
      label: 'Review & Generate',
      description: 'Review the generated plan and create it'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Test Plans Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setOpenFilterDrawer(true)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoIcon />}
            onClick={() => setOpenAutoGenerator(true)}
            sx={{ mr: 1 }}
            color="secondary"
          >
            AI Auto-Generator
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Plan
          </Button>
        </Box>
      </Box>

      {/* Test Plans Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Test Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Scenarios</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.testType}
                        color={getTestTypeColor(plan.testType) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.status}
                        color={getStatusColor(plan.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{plan.createdBy}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${plan.scenarios?.length || 0} scenarios`}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {plan.estimatedDuration ? `${plan.estimatedDuration}h` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(plan)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(plan.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPlan ? 'Edit Test Plan' : 'Create New Test Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plan Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                  label="Test Type"
                  required
                >
                  <MenuItem value="Regression">Regression Testing</MenuItem>
                  <MenuItem value="UAT">User Acceptance Testing</MenuItem>
                  <MenuItem value="SIT">System Integration Testing</MenuItem>
                  <MenuItem value="Performance">Performance Testing</MenuItem>
                  <MenuItem value="Security">Security Testing</MenuItem>
                  <MenuItem value="Patch">Patch Testing</MenuItem>
                  <MenuItem value="Compatibility">Compatibility Testing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                  label="Risk Level"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Objective"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Duration (hours)"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Auto-Generator Dialog */}
      <Dialog open={openAutoGenerator} onClose={() => setOpenAutoGenerator(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoIcon sx={{ mr: 1 }} color="secondary" />
            AI-Powered Test Plan Generator
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={autoGeneratorStep} orientation="vertical">
            {autoGeneratorSteps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  
                  {index === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Test Type</InputLabel>
                          <Select
                            value={autoGeneratorConfig.testType}
                            onChange={(e) => setAutoGeneratorConfig({ ...autoGeneratorConfig, testType: e.target.value })}
                            label="Test Type"
                          >
                            <MenuItem value="Regression">Regression Testing</MenuItem>
                            <MenuItem value="UAT">User Acceptance Testing</MenuItem>
                            <MenuItem value="SIT">System Integration Testing</MenuItem>
                            <MenuItem value="Performance">Performance Testing</MenuItem>
                            <MenuItem value="Security">Security Testing</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Risk Tolerance</InputLabel>
                          <Select
                            value={autoGeneratorConfig.riskTolerance}
                            onChange={(e) => setAutoGeneratorConfig({ ...autoGeneratorConfig, riskTolerance: e.target.value })}
                            label="Risk Tolerance"
                          >
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}

                  {index === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Select Modules/Features
                        </Typography>
                        <FormControl component="fieldset">
                          {['User Management', 'Authentication', 'Reporting', 'Data Processing'].map((module) => (
                            <FormControlLabel
                              key={module}
                              control={
                                <Checkbox
                                  checked={autoGeneratorConfig.modules.includes(module)}
                                  onChange={(e) => {
                                    const newModules = e.target.checked
                                      ? [...autoGeneratorConfig.modules, module]
                                      : autoGeneratorConfig.modules.filter(m => m !== module);
                                    setAutoGeneratorConfig({ ...autoGeneratorConfig, modules: newModules });
                                  }}
                                />
                              }
                              label={module}
                            />
                          ))}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Priority Levels
                        </Typography>
                        <FormControl component="fieldset">
                          {['Critical', 'High', 'Medium', 'Low'].map((priority) => (
                            <FormControlLabel
                              key={priority}
                              control={
                                <Checkbox
                                  checked={autoGeneratorConfig.priorities.includes(priority)}
                                  onChange={(e) => {
                                    const newPriorities = e.target.checked
                                      ? [...autoGeneratorConfig.priorities, priority]
                                      : autoGeneratorConfig.priorities.filter(p => p !== priority);
                                    setAutoGeneratorConfig({ ...autoGeneratorConfig, priorities: newPriorities });
                                  }}
                                />
                              }
                              label={priority}
                            />
                          ))}
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}

                  {index === 2 && (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        AI is analyzing your requirements and optimizing scenario selection...
                      </Typography>
                      <LinearProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        • Analyzing defect history for high-risk scenarios
                        • Identifying coverage gaps
                        • Optimizing execution order
                        • Estimating resource requirements
                      </Typography>
                    </Box>
                  )}

                  {index === 3 && (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Review the AI-generated test plan configuration:
                      </Typography>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2">
                          Selected Scenarios: {scenarios.filter(s => 
                            autoGeneratorConfig.modules.includes(s.moduleFeature) &&
                            autoGeneratorConfig.priorities.includes(s.priority)
                          ).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Estimated Duration: {scenarios.filter(s => 
                            autoGeneratorConfig.modules.includes(s.moduleFeature) &&
                            autoGeneratorConfig.priorities.includes(s.priority)
                          ).reduce((acc, s) => acc + (s.estimatedDuration || 0), 0) / 60} hours
                        </Typography>
                      </Card>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (autoGeneratorStep === autoGeneratorSteps.length - 1) {
                          handleAutoGenerate();
                        } else {
                          setAutoGeneratorStep((prevStep) => prevStep + 1);
                        }
                      }}
                      sx={{ mr: 1 }}
                    >
                      {autoGeneratorStep === autoGeneratorSteps.length - 1 ? 'Generate Plan' : 'Continue'}
                    </Button>
                    <Button
                      disabled={autoGeneratorStep === 0}
                      onClick={() => setAutoGeneratorStep((prevStep) => prevStep - 1)}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filters
          </Typography>
          <List>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={filters.testType}
                  onChange={(e) => setFilters({ ...filters, testType: e.target.value })}
                  label="Test Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Regression">Regression</MenuItem>
                  <MenuItem value="UAT">UAT</MenuItem>
                  <MenuItem value="SIT">SIT</MenuItem>
                  <MenuItem value="Performance">Performance</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={filters.riskLevel}
                  onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                  label="Risk Level"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setFilters({
                testType: '',
                status: '',
                createdBy: '',
                riskLevel: ''
              });
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default TestPlans;
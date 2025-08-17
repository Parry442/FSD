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
  StepContent,
  Badge,
  Avatar,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface TestCycle {
  id: string;
  name: string;
  description: string;
  testPlanId: string;
  testPlanName: string;
  status: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  assignedTesters: string[];
  totalScenarios: number;
  completedScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  blockedScenarios: number;
  progress: number;
}

interface TestExecution {
  id: string;
  testScenarioId: string;
  testScenarioTitle: string;
  assignedTester: string;
  status: string;
  startTime: string;
  endTime: string;
  result: string;
  comments: string;
  attachments: string[];
  defects: string[];
}

const TestCycles: React.FC = () => {
  const [testCycles, setTestCycles] = useState<TestCycle[]>([]);
  const [testPlans, setTestPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [openExecutionDialog, setOpenExecutionDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<TestCycle | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    testPlan: '',
    assignedTester: '',
    dateRange: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    testPlanId: '',
    startDate: '',
    endDate: '',
    assignedTesters: [] as string[]
  });

  // Assignment state
  const [assignmentData, setAssignmentData] = useState({
    testers: [] as string[],
    scenarios: [] as string[]
  });

  // Execution state
  const [executionData, setExecutionData] = useState({
    status: '',
    result: '',
    comments: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    fetchTestCycles();
    fetchTestPlans();
    fetchUsers();
  }, [page, filters]);

  const fetchTestCycles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.testPlan && { testPlan: filters.testPlan }),
        ...(filters.assignedTester && { assignedTester: filters.assignedTester })
      });

      const response = await axios.get(`/api/test-cycles?${params}`);
      setTestCycles(response.data.testCycles);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (error) {
      enqueueSnackbar('Failed to fetch test cycles', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestPlans = async () => {
    try {
      const response = await axios.get('/api/test-plans?limit=1000&status=Approved');
      setTestPlans(response.data.testPlans);
    } catch (error) {
      console.error('Failed to fetch test plans:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users?role=Tester');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedCycle) {
        await axios.put(`/api/test-cycles/${selectedCycle.id}`, formData);
        enqueueSnackbar('Test cycle updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/test-cycles', formData);
        enqueueSnackbar('Test cycle created successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      resetForm();
      fetchTestCycles();
    } catch (error) {
      enqueueSnackbar('Failed to save test cycle', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test cycle?')) {
      try {
        await axios.delete(`/api/test-cycles/${id}`);
        enqueueSnackbar('Test cycle deleted successfully', { variant: 'success' });
        fetchTestCycles();
      } catch (error) {
        enqueueSnackbar('Failed to delete test cycle', { variant: 'error' });
      }
    }
  };

  const handleEdit = (cycle: TestCycle) => {
    setSelectedCycle(cycle);
    setFormData({
      name: cycle.name,
      description: cycle.description,
      testPlanId: cycle.testPlanId,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      assignedTesters: cycle.assignedTesters || []
    });
    setOpenDialog(true);
  };

  const handleStartCycle = async (id: string) => {
    try {
      await axios.post(`/api/test-cycles/${id}/start`);
      enqueueSnackbar('Test cycle started successfully', { variant: 'success' });
      fetchTestCycles();
    } catch (error) {
      enqueueSnackbar('Failed to start test cycle', { variant: 'error' });
    }
  };

  const handleStopCycle = async (id: string) => {
    try {
      await axios.post(`/api/test-cycles/${id}/stop`);
      enqueueSnackbar('Test cycle stopped successfully', { variant: 'success' });
      fetchTestCycles();
    } catch (error) {
      enqueueSnackbar('Failed to stop test cycle', { variant: 'error' });
    }
  };

  const handleAssignTesters = async (cycleId: string) => {
    try {
      await axios.post(`/api/test-cycles/${cycleId}/assign`, assignmentData);
      enqueueSnackbar('Testers assigned successfully', { variant: 'success' });
      setOpenAssignmentDialog(false);
      fetchTestCycles();
    } catch (error) {
      enqueueSnackbar('Failed to assign testers', { variant: 'error' });
    }
  };

  const handleExecutionUpdate = async () => {
    if (!selectedExecution) return;

    try {
      await axios.put(`/api/test-executions/${selectedExecution.id}`, executionData);
      enqueueSnackbar('Execution updated successfully', { variant: 'success' });
      setOpenExecutionDialog(false);
      fetchTestCycles();
    } catch (error) {
      enqueueSnackbar('Failed to update execution', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      testPlanId: '',
      startDate: '',
      endDate: '',
      assignedTesters: []
    });
    setSelectedCycle(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'In Progress': return 'primary';
      case 'Paused': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const canStartCycle = (cycle: TestCycle) => {
    return cycle.status === 'Draft' && cycle.assignedTesters.length > 0;
  };

  const canStopCycle = (cycle: TestCycle) => {
    return ['In Progress', 'Paused'].includes(cycle.status);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Test Cycles Management
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
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Cycle
          </Button>
        </Box>
      </Box>

      {/* Test Cycles Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Test Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Testers</TableCell>
                  <TableCell>Results</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testCycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {cycle.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cycle.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{cycle.testPlanName}</TableCell>
                    <TableCell>
                      <Chip
                        label={cycle.status}
                        color={getStatusColor(cycle.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={cycle.progress}
                            color={getProgressColor(cycle.progress) as any}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {cycle.progress}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {cycle.completedScenarios}/{cycle.totalScenarios} scenarios
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {cycle.assignedTesters.slice(0, 3).map((tester, index) => (
                          <Avatar key={index} sx={{ width: 24, height: 24 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        ))}
                        {cycle.assignedTesters.length > 3 && (
                          <Chip
                            label={`+${cycle.assignedTesters.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip
                          label={`Pass: ${cycle.passedScenarios}`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Fail: ${cycle.failedScenarios}`}
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                        {cycle.blockedScenarios > 0 && (
                          <Chip
                            label={`Blocked: ${cycle.blockedScenarios}`}
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign Testers">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedCycle(cycle);
                              setOpenAssignmentDialog(true);
                            }}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        {canStartCycle(cycle) && (
                          <Tooltip title="Start Cycle">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleStartCycle(cycle.id)}
                            >
                              <StartIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canStopCycle(cycle) && (
                          <Tooltip title="Stop Cycle">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleStopCycle(cycle.id)}
                            >
                              <StopIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(cycle)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(cycle.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
          {selectedCycle ? 'Edit Test Cycle' : 'Create New Test Cycle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cycle Name"
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
                <InputLabel>Test Plan</InputLabel>
                <Select
                  value={formData.testPlanId}
                  onChange={(e) => setFormData({ ...formData, testPlanId: e.target.value })}
                  label="Test Plan"
                  required
                >
                  {testPlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned Testers</InputLabel>
                <Select
                  multiple
                  value={formData.assignedTesters}
                  onChange={(e) => setFormData({ ...formData, assignedTesters: e.target.value as string[] })}
                  label="Assigned Testers"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCycle ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assign Testers to Scenarios</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Testers
              </Typography>
              <FormControl component="fieldset">
                {users.map((user) => (
                  <FormControlLabel
                    key={user.id}
                    control={
                      <Checkbox
                        checked={assignmentData.testers.includes(user.id)}
                        onChange={(e) => {
                          const newTesters = e.target.checked
                            ? [...assignmentData.testers, user.id]
                            : assignmentData.testers.filter(t => t !== user.id);
                          setAssignmentData({ ...assignmentData, testers: newTesters });
                        }}
                      />
                    }
                    label={user.name}
                  />
                ))}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedCycle && handleAssignTesters(selectedCycle.id)} 
            variant="contained"
            disabled={assignmentData.testers.length === 0}
          >
            Assign Testers
          </Button>
        </DialogActions>
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Paused">Paused</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Test Plan</InputLabel>
                <Select
                  value={filters.testPlan}
                  onChange={(e) => setFilters({ ...filters, testPlan: e.target.value })}
                  label="Test Plan"
                >
                  <MenuItem value="">All</MenuItem>
                  {testPlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Assigned Tester</InputLabel>
                <Select
                  value={filters.assignedTester}
                  onChange={(e) => setFilters({ ...filters, assignedTester: e.target.value })}
                  label="Assigned Tester"
                >
                  <MenuItem value="">All</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
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
                status: '',
                testPlan: '',
                assignedTester: '',
                dateRange: ''
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

export default TestCycles;
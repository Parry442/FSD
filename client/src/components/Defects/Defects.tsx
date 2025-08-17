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
  Stack,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  BugReport as BugIcon,
  Build as BuildIcon,
  Verified as VerifiedIcon,
  History as HistoryIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface Defect {
  id: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: string;
  category: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo: string;
  assignedDate: string;
  testScenarioId: string;
  testScenarioTitle: string;
  testCycleId: string;
  testCycleName: string;
  environment: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  attachments: string[];
  resolutionNotes: string;
  resolvedDate: string;
  resolvedBy: string;
  retestRequired: boolean;
  retestResult: string;
  retestDate: string;
  retestedBy: string;
  version: string;
  tags: string[];
}

interface DefectHistory {
  id: string;
  defectId: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  fromAssignee: string;
  toAssignee: string;
  comments: string;
  timestamp: string;
  performedBy: string;
}

const Defects: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [testScenarios, setTestScenarios] = useState<any[]>([]);
  const [testCycles, setTestCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [openResolutionDialog, setOpenResolutionDialog] = useState(false);
  const [openRetestDialog, setOpenRetestDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<DefectHistory[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    priority: '',
    category: '',
    assignedTo: '',
    reportedBy: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    priority: 'Medium',
    category: '',
    testScenarioId: '',
    testCycleId: '',
    environment: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    tags: [] as string[]
  });

  // Assignment state
  const [assignmentData, setAssignmentData] = useState({
    assignedTo: '',
    comments: ''
  });

  // Resolution state
  const [resolutionData, setResolutionData] = useState({
    resolutionNotes: '',
    status: 'Resolved'
  });

  // Retest state
  const [retestData, setRetestData] = useState({
    retestResult: '',
    comments: ''
  });

  useEffect(() => {
    fetchDefects();
    fetchUsers();
    fetchTestScenarios();
    fetchTestCycles();
  }, [page, filters]);

  const fetchDefects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.category && { category: filters.category }),
        ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
        ...(filters.reportedBy && { reportedBy: filters.reportedBy })
      });

      const response = await axios.get(`/api/defects?${params}`);
      setDefects(response.data.defects);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (error) {
      enqueueSnackbar('Failed to fetch defects', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTestScenarios = async () => {
    try {
      const response = await axios.get('/api/test-scenarios?limit=1000');
      setTestScenarios(response.data.scenarios);
    } catch (error) {
      console.error('Failed to fetch test scenarios:', error);
    }
  };

  const fetchTestCycles = async () => {
    try {
      const response = await axios.get('/api/test-cycles?limit=1000');
      setTestCycles(response.data.testCycles);
    } catch (error) {
      console.error('Failed to fetch test cycles:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedDefect) {
        await axios.put(`/api/defects/${selectedDefect.id}`, formData);
        enqueueSnackbar('Defect updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/defects', formData);
        enqueueSnackbar('Defect created successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      resetForm();
      fetchDefects();
    } catch (error) {
      enqueueSnackbar('Failed to save defect', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this defect?')) {
      try {
        await axios.delete(`/api/defects/${id}`);
        enqueueSnackbar('Defect deleted successfully', { variant: 'success' });
        fetchDefects();
      } catch (error) {
        enqueueSnackbar('Failed to delete defect', { variant: 'error' });
      }
    }
  };

  const handleEdit = (defect: Defect) => {
    setSelectedDefect(defect);
    setFormData({
      title: defect.title,
      description: defect.description,
      severity: defect.severity,
      priority: defect.priority,
      category: defect.category,
      testScenarioId: defect.testScenarioId,
      testCycleId: defect.testCycleId,
      environment: defect.environment,
      stepsToReproduce: defect.stepsToReproduce,
      expectedBehavior: defect.expectedBehavior,
      actualBehavior: defect.actualBehavior,
      tags: defect.tags || []
    });
    setOpenDialog(true);
  };

  const handleAssign = async (defectId: string) => {
    try {
      await axios.post(`/api/defects/${defectId}/assign`, assignmentData);
      enqueueSnackbar('Defect assigned successfully', { variant: 'success' });
      setOpenAssignmentDialog(false);
      fetchDefects();
    } catch (error) {
      enqueueSnackbar('Failed to assign defect', { variant: 'error' });
    }
  };

  const handleResolve = async (defectId: string) => {
    try {
      await axios.post(`/api/defects/${defectId}/resolve`, resolutionData);
      enqueueSnackbar('Defect resolved successfully', { variant: 'success' });
      setOpenResolutionDialog(false);
      fetchDefects();
    } catch (error) {
      enqueueSnackbar('Failed to resolve defect', { variant: 'error' });
    }
  };

  const handleRetest = async (defectId: string) => {
    try {
      await axios.post(`/api/defects/${defectId}/retest`, retestData);
      enqueueSnackbar('Retest completed successfully', { variant: 'success' });
      setOpenRetestDialog(false);
      fetchDefects();
    } catch (error) {
      enqueueSnackbar('Failed to complete retest', { variant: 'error' });
    }
  };

  const handleViewHistory = async (defectId: string) => {
    try {
      const response = await axios.get(`/api/defects/${defectId}/history`);
      setSelectedHistory(response.data.history);
      setOpenHistoryDialog(true);
    } catch (error) {
      enqueueSnackbar('Failed to fetch defect history', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'Medium',
      priority: 'Medium',
      category: '',
      testScenarioId: '',
      testCycleId: '',
      environment: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      tags: []
    });
    setSelectedDefect(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'info';
      case 'Pending Confirmation': return 'warning';
      case 'Confirmed Closed': return 'success';
      case 'Closed': return 'success';
      default: return 'default';
    }
  };

  const canAssign = (defect: Defect) => {
    return defect.status === 'Open' || defect.status === 'In Progress';
  };

  const canResolve = (defect: Defect) => {
    return defect.status === 'In Progress';
  };

  const canRetest = (defect: Defect) => {
    return defect.status === 'Pending Confirmation';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Defect Repository
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
            Report Defect
          </Button>
        </Box>
      </Box>

      {/* Defects Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Test Scenario</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {defects.map((defect) => (
                  <TableRow key={defect.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {defect.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {defect.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {defect.description.substring(0, 100)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reported: {new Date(defect.reportedDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={defect.severity}
                        color={getSeverityColor(defect.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={defect.priority}
                        color={getPriorityColor(defect.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={defect.status}
                        color={getStatusColor(defect.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {defect.assignedTo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {users.find(u => u.id === defect.assignedTo)?.name || defect.assignedTo}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {defect.testScenarioTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {defect.testCycleName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View History">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewHistory(defect.id)}
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                        {canAssign(defect) && (
                          <Tooltip title="Assign">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedDefect(defect);
                                setOpenAssignmentDialog(true);
                              }}
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canResolve(defect) && (
                          <Tooltip title="Resolve">
                            <IconButton 
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedDefect(defect);
                                setOpenResolutionDialog(true);
                              }}
                            >
                              <BuildIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canRetest(defect) && (
                          <Tooltip title="Retest">
                            <IconButton 
                              size="small"
                              color="info"
                              onClick={() => {
                                setSelectedDefect(defect);
                                setOpenRetestDialog(true);
                              }}
                            >
                              <VerifiedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(defect)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(defect.id)}>
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
          {selectedDefect ? 'Edit Defect' : 'Report New Defect'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  label="Severity"
                  required
                >
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  label="Priority"
                  required
                >
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="Functional">Functional</MenuItem>
                  <MenuItem value="UI/UX">UI/UX</MenuItem>
                  <MenuItem value="Performance">Performance</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Database">Database</MenuItem>
                  <MenuItem value="Integration">Integration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Test Scenario</InputLabel>
                <Select
                  value={formData.testScenarioId}
                  onChange={(e) => setFormData({ ...formData, testScenarioId: e.target.value })}
                  label="Test Scenario"
                >
                  {testScenarios.map((scenario) => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Steps to Reproduce"
                value={formData.stepsToReproduce}
                onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expected Behavior"
                value={formData.expectedBehavior}
                onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Actual Behavior"
                value={formData.actualBehavior}
                onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedDefect ? 'Update' : 'Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)}>
        <DialogTitle>Assign Defect</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={assignmentData.assignedTo}
                  onChange={(e) => setAssignmentData({ ...assignmentData, assignedTo: e.target.value })}
                  label="Assign To"
                  required
                >
                  {users.filter(u => u.role === 'Troubleshooter').map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                value={assignmentData.comments}
                onChange={(e) => setAssignmentData({ ...assignmentData, comments: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedDefect && handleAssign(selectedDefect.id)} 
            variant="contained"
            disabled={!assignmentData.assignedTo}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={openResolutionDialog} onClose={() => setOpenResolutionDialog(false)}>
        <DialogTitle>Resolve Defect</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={resolutionData.status}
                  onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value })}
                  label="Status"
                  required
                >
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Pending Confirmation">Pending Confirmation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resolution Notes"
                value={resolutionData.resolutionNotes}
                onChange={(e) => setResolutionData({ ...resolutionData, resolutionNotes: e.target.value })}
                multiline
                rows={4}
                required
                placeholder="Describe the solution implemented to fix this defect..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResolutionDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedDefect && handleResolve(selectedDefect.id)} 
            variant="contained"
            disabled={!resolutionData.resolutionNotes}
          >
            Resolve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Retest Dialog */}
      <Dialog open={openRetestDialog} onClose={() => setOpenRetestDialog(false)}>
        <DialogTitle>Retest Defect</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Retest Result</InputLabel>
                <Select
                  value={retestData.retestResult}
                  onChange={(e) => setRetestData({ ...retestData, retestResult: e.target.value })}
                  label="Retest Result"
                  required
                >
                  <MenuItem value="Passed">Passed</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                value={retestData.comments}
                onChange={(e) => setRetestData({ ...retestData, comments: e.target.value })}
                multiline
                rows={3}
                placeholder="Add any additional comments about the retest..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRetestDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedDefect && handleRetest(selectedDefect.id)} 
            variant="contained"
            disabled={!retestData.retestResult}
          >
            Complete Retest
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Defect History</DialogTitle>
        <DialogContent>
          <Timeline>
            {selectedHistory.map((item, index) => (
              <TimelineItem key={item.id}>
                <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
                  {new Date(item.timestamp).toLocaleString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  {index < selectedHistory.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Typography variant="h6" component="span">
                    {item.action}
                  </Typography>
                  <Typography variant="body2">
                    {item.comments}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By: {item.performedBy}
                  </Typography>
                  {item.fromStatus !== item.toStatus && (
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={item.fromStatus} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" sx={{ mx: 1 }}>→</Typography>
                      <Chip 
                        label={item.toStatus} 
                        size="small" 
                        color="primary"
                      />
                    </Box>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
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
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Pending Confirmation">Pending Confirmation</MenuItem>
                  <MenuItem value="Confirmed Closed">Confirmed Closed</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  label="Severity"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Functional">Functional</MenuItem>
                  <MenuItem value="UI/UX">UI/UX</MenuItem>
                  <MenuItem value="Performance">Performance</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Database">Database</MenuItem>
                  <MenuItem value="Integration">Integration</MenuItem>
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
                severity: '',
                priority: '',
                category: '',
                assignedTo: '',
                reportedBy: ''
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

export default Defects;
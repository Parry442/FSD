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
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface TestScenario {
  id: string;
  scenarioId: string;
  title: string;
  moduleFeature: string;
  businessProcess: string;
  scenarioType: string;
  priority: string;
  frequencyOfUse: string;
  owner: string;
  scenarioDescription: string;
  preconditionsSetup: string;
  stepNo: number;
  action: string;
  systemRole: string;
  input: string;
  expectedOutcome: string;
  testDataRequirements: string;
  automated: boolean;
  scriptId: string;
  dependencies: string;
  scenarioStatus: string;
  endDate: string;
  lastUpdated: string;
  reviewedBy: string;
  version: number;
  tags: string[];
  estimatedDuration: number;
  riskLevel: string;
}

const TestScenarios: React.FC = () => {
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    moduleFeature: '',
    scenarioType: '',
    priority: '',
    status: '',
    owner: '',
    tags: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    moduleFeature: '',
    businessProcess: '',
    scenarioType: 'Functional',
    priority: 'Medium',
    frequencyOfUse: 'On-Demand',
    scenarioDescription: '',
    preconditionsSetup: '',
    stepNo: 1,
    action: '',
    systemRole: '',
    input: '',
    expectedOutcome: '',
    testDataRequirements: '',
    automated: false,
    scriptId: '',
    dependencies: '',
    tags: [] as string[],
    estimatedDuration: 0,
    riskLevel: 'Medium'
  });

  useEffect(() => {
    fetchScenarios();
  }, [page, searchTerm, filters]);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.moduleFeature && { moduleFeature: filters.moduleFeature }),
        ...(filters.scenarioType && { scenarioType: filters.scenarioType }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.status && { status: filters.status }),
        ...(filters.owner && { owner: filters.owner }),
        ...(filters.tags && { tags: filters.tags })
      });

      const response = await axios.get(`/api/test-scenarios?${params}`);
      setScenarios(response.data.scenarios);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (error) {
      enqueueSnackbar('Failed to fetch scenarios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedScenario) {
        await axios.put(`/api/test-scenarios/${selectedScenario.id}`, formData);
        enqueueSnackbar('Scenario updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/test-scenarios', formData);
        enqueueSnackbar('Scenario created successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      resetForm();
      fetchScenarios();
    } catch (error) {
      enqueueSnackbar('Failed to save scenario', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scenario?')) {
      try {
        await axios.delete(`/api/test-scenarios/${id}`);
        enqueueSnackbar('Scenario deleted successfully', { variant: 'success' });
        fetchScenarios();
      } catch (error) {
        enqueueSnackbar('Failed to delete scenario', { variant: 'error' });
      }
    }
  };

  const handleEdit = (scenario: TestScenario) => {
    setSelectedScenario(scenario);
    setFormData({
      title: scenario.title,
      moduleFeature: scenario.moduleFeature,
      businessProcess: scenario.businessProcess || '',
      scenarioType: scenario.scenarioType,
      priority: scenario.priority,
      frequencyOfUse: scenario.frequencyOfUse,
      scenarioDescription: scenario.scenarioDescription,
      preconditionsSetup: scenario.preconditionsSetup || '',
      stepNo: scenario.stepNo,
      action: scenario.action,
      systemRole: scenario.systemRole || '',
      input: scenario.input || '',
      expectedOutcome: scenario.expectedOutcome,
      testDataRequirements: scenario.testDataRequirements || '',
      automated: scenario.automated,
      scriptId: scenario.scriptId || '',
      dependencies: scenario.dependencies || '',
      tags: scenario.tags || [],
      estimatedDuration: scenario.estimatedDuration || 0,
      riskLevel: scenario.riskLevel || 'Medium'
    });
    setOpenDialog(true);
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      await axios.post('/api/test-scenarios/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      enqueueSnackbar('Scenarios uploaded successfully', { variant: 'success' });
      setOpenUploadDialog(false);
      setUploadedFile(null);
      fetchScenarios();
    } catch (error) {
      enqueueSnackbar('Failed to upload scenarios', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      moduleFeature: '',
      businessProcess: '',
      scenarioType: 'Functional',
      priority: 'Medium',
      frequencyOfUse: 'On-Demand',
      scenarioDescription: '',
      preconditionsSetup: '',
      stepNo: 1,
      action: '',
      systemRole: '',
      input: '',
      expectedOutcome: '',
      testDataRequirements: '',
      automated: false,
      scriptId: '',
      dependencies: '',
      tags: [],
      estimatedDuration: 0,
      riskLevel: 'Medium'
    });
    setSelectedScenario(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    onDrop: (acceptedFiles) => {
      setUploadedFile(acceptedFiles[0]);
    }
  });

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
      case 'Active': return 'success';
      case 'End-Dated': return 'error';
      case 'Draft': return 'warning';
      case 'Under Review': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Test Scenarios Repository
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
            startIcon={<UploadIcon />}
            onClick={() => setOpenUploadDialog(true)}
            sx={{ mr: 1 }}
          >
            Upload Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Scenario
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search scenarios by title, ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </CardContent>
      </Card>

      {/* Scenarios Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Scenario ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Module/Feature</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.id}>
                    <TableCell>{scenario.scenarioId}</TableCell>
                    <TableCell>{scenario.title}</TableCell>
                    <TableCell>{scenario.moduleFeature}</TableCell>
                    <TableCell>{scenario.scenarioType}</TableCell>
                    <TableCell>
                      <Chip
                        label={scenario.priority}
                        color={getPriorityColor(scenario.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={scenario.scenarioStatus}
                        color={getStatusColor(scenario.scenarioStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{scenario.owner}</TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(scenario)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(scenario.id)}>
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
          {selectedScenario ? 'Edit Test Scenario' : 'Add New Test Scenario'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Module/Feature"
                value={formData.moduleFeature}
                onChange={(e) => setFormData({ ...formData, moduleFeature: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Scenario Type</InputLabel>
                <Select
                  value={formData.scenarioType}
                  onChange={(e) => setFormData({ ...formData, scenarioType: e.target.value })}
                  label="Scenario Type"
                >
                  <MenuItem value="Functional">Functional</MenuItem>
                  <MenuItem value="Non-Functional">Non-Functional</MenuItem>
                  <MenuItem value="Integration">Integration</MenuItem>
                  <MenuItem value="Regression">Regression</MenuItem>
                  <MenuItem value="UAT">UAT</MenuItem>
                  <MenuItem value="SIT">SIT</MenuItem>
                  <MenuItem value="Performance">Performance</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
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
                >
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scenario Description"
                value={formData.scenarioDescription}
                onChange={(e) => setFormData({ ...formData, scenarioDescription: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Action"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expected Outcome"
                value={formData.expectedOutcome}
                onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.automated}
                    onChange={(e) => setFormData({ ...formData, automated: e.target.checked })}
                  />
                }
                label="Automated"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
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
            {selectedScenario ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)}>
        <DialogTitle>Upload Test Scenarios from Excel</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' }
            }}
          >
            <input {...getInputProps()} />
            {uploadedFile ? (
              <Typography>{uploadedFile.name}</Typography>
            ) : (
              <Typography>Drag & drop an Excel file here, or click to select</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadedFile}
          >
            Upload
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
                <InputLabel>Module/Feature</InputLabel>
                <Select
                  value={filters.moduleFeature}
                  onChange={(e) => setFilters({ ...filters, moduleFeature: e.target.value })}
                  label="Module/Feature"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="User Management">User Management</MenuItem>
                  <MenuItem value="Authentication">Authentication</MenuItem>
                  <MenuItem value="Reporting">Reporting</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem>
              <FormControl fullWidth>
                <InputLabel>Scenario Type</InputLabel>
                <Select
                  value={filters.scenarioType}
                  onChange={(e) => setFilters({ ...filters, scenarioType: e.target.value })}
                  label="Scenario Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Functional">Functional</MenuItem>
                  <MenuItem value="Non-Functional">Non-Functional</MenuItem>
                  <MenuItem value="Integration">Integration</MenuItem>
                  <MenuItem value="Regression">Regression</MenuItem>
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="End-Dated">End-Dated</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
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
                moduleFeature: '',
                scenarioType: '',
                priority: '',
                status: '',
                owner: '',
                tags: ''
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

export default TestScenarios;
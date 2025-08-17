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
  Avatar,
  Stack,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  BugReport as BugIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  department: string;
  phone: string;
  avatar: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    role: 'Tester',
    department: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Permissions state
  const [permissionsData, setPermissionsData] = useState({
    permissions: [] as string[]
  });

  const availablePermissions = [
    'test_scenarios:read',
    'test_scenarios:write',
    'test_scenarios:delete',
    'test_plans:read',
    'test_plans:write',
    'test_plans:delete',
    'test_cycles:read',
    'test_cycles:write',
    'test_cycles:delete',
    'defects:read',
    'defects:write',
    'defects:delete',
    'users:read',
    'users:write',
    'users:delete',
    'reports:read',
    'reports:write',
    'ai_features:access'
  ];

  const rolePermissions = {
    'Test Manager': [
      'test_scenarios:read', 'test_scenarios:write', 'test_scenarios:delete',
      'test_plans:read', 'test_plans:write', 'test_plans:delete',
      'test_cycles:read', 'test_cycles:write', 'test_cycles:delete',
      'defects:read', 'defects:write', 'defects:delete',
      'users:read', 'users:write',
      'reports:read', 'reports:write',
      'ai_features:access'
    ],
    'Tester': [
      'test_scenarios:read',
      'test_plans:read',
      'test_cycles:read',
      'defects:read', 'defects:write',
      'reports:read'
    ],
    'Troubleshooter': [
      'test_scenarios:read',
      'test_plans:read',
      'test_cycles:read',
      'defects:read', 'defects:write',
      'reports:read'
    ],
    'Viewer': [
      'test_scenarios:read',
      'test_plans:read',
      'test_cycles:read',
      'defects:read',
      'reports:read'
    ]
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`/api/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (error) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Passwords do not match', { variant: 'error' });
        return;
      }

      if (selectedUser) {
        const updateData = { ...formData };
        delete updateData.password;
        delete updateData.confirmPassword;
        
        await axios.put(`/api/users/${selectedUser.id}`, updateData);
        enqueueSnackbar('User updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/users', formData);
        enqueueSnackbar('User created successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      enqueueSnackbar('Failed to save user', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchUsers();
      } catch (error) {
        enqueueSnackbar('Failed to delete user', { variant: 'error' });
      }
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
      password: '',
      confirmPassword: ''
    });
    setOpenDialog(true);
  };

  const handlePermissions = (user: User) => {
    setSelectedUser(user);
    setPermissionsData({
      permissions: user.permissions || []
    });
    setOpenPermissionsDialog(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(`/api/users/${selectedUser.id}/permissions`, permissionsData);
      enqueueSnackbar('Permissions updated successfully', { variant: 'success' });
      setOpenPermissionsDialog(false);
      fetchUsers();
    } catch (error) {
      enqueueSnackbar('Failed to update permissions', { variant: 'error' });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await axios.patch(`/api/users/${userId}/status`, { status: newStatus });
      enqueueSnackbar(`User ${newStatus.toLowerCase()} successfully`, { variant: 'success' });
      fetchUsers();
    } catch (error) {
      enqueueSnackbar('Failed to update user status', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      role: 'Tester',
      department: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Test Manager': return 'error';
      case 'Tester': return 'primary';
      case 'Troubleshooter': return 'warning';
      case 'Viewer': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'error';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Test Manager': return <AdminIcon />;
      case 'Tester': return <AssignmentIcon />;
      case 'Troubleshooter': return <BugIcon />;
      case 'Viewer': return <VisibilityIcon />;
      default: return <PersonIcon />;
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData({ ...formData, role });
    // Auto-set permissions based on role
    if (rolePermissions[role as keyof typeof rolePermissions]) {
      setPermissionsData({
        permissions: rolePermissions[role as keyof typeof rolePermissions]
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add User
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                          ) : (
                            getRoleIcon(user.role)
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.department || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Permissions">
                          <IconButton size="small" onClick={() => handlePermissions(user)}>
                            <LockIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.status === 'Active' ? 'Deactivate' : 'Activate'}>
                          <IconButton 
                            size="small"
                            color={user.status === 'Active' ? 'warning' : 'success'}
                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                          >
                            {user.status === 'Active' ? <LockIcon /> : <UnlockIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(user.id)}>
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
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={!!selectedUser}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  label="Role"
                  required
                >
                  <MenuItem value="Test Manager">Test Manager</MenuItem>
                  <MenuItem value="Tester">Tester</MenuItem>
                  <MenuItem value="Troubleshooter">Troubleshooter</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            {!selectedUser && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={openPermissionsDialog} onClose={() => setOpenPermissionsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Permissions - {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Role: <strong>{selectedUser?.role}</strong> - These permissions are automatically set based on the user's role.
          </Alert>
          
          <Grid container spacing={2}>
            {availablePermissions.map((permission) => {
              const [resource, action] = permission.split(':');
              return (
                <Grid item xs={12} md={6} key={permission}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissionsData.permissions.includes(permission)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...permissionsData.permissions, permission]
                            : permissionsData.permissions.filter(p => p !== permission);
                          setPermissionsData({ permissions: newPermissions });
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {resource.charAt(0).toUpperCase() + resource.slice(1).replace('_', ' ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {action === 'read' ? 'View' : action === 'write' ? 'Create/Edit' : 'Delete'}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermissionsDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdatePermissions} variant="contained">
            Update Permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
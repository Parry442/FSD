import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assignment,
  PlayCircleOutline,
  BugReport,
  People,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Error,
  Schedule,
  Speed,
  Refresh,
  Add,
  Assessment
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types
interface DashboardStats {
  overview: {
    total: number;
    active: number;
    endDated: number;
    automated: number;
  };
  moduleStats: Array<{ moduleFeature: string; count: number }>;
  typeStats: Array<{ scenarioType: string; count: number }>;
  priorityStats: Array<{ priority: string; count: number }>;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  user: string;
  status?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useWebSocket();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch dashboard data
  const { data: stats, isLoading, refetch } = useQuery<DashboardStats>(
    'dashboardStats',
    async () => {
      const response = await axios.get('/api/test-scenarios/stats/overview');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 60000, // Consider data stale after 1 minute
    }
  );

  // Fetch recent activity
  const { data: recentActivity } = useQuery<RecentActivity[]>(
    'recentActivity',
    async () => {
      // This would be a real endpoint in production
      return [
        {
          id: '1',
          type: 'scenario',
          title: 'User Login Validation updated',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          user: 'John Tester',
          status: 'updated'
        },
        {
          id: '2',
          type: 'execution',
          title: 'Test execution completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          user: 'Jane Tester',
          status: 'passed'
        },
        {
          id: '3',
          type: 'defect',
          title: 'New defect reported',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          user: 'Mike Developer',
          status: 'open'
        }
      ];
    }
  );

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'updated': return 'info';
      case 'open': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle fontSize="small" />;
      case 'failed': return <Error fontSize="small" />;
      case 'updated': return <Assignment fontSize="small" />;
      case 'open': return <BugReport fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your testing activities today.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={isConnected ? <CheckCircle /> : <Error />}
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Scenarios
                  </Typography>
                  <Typography variant="h4">
                    {stats?.overview.total || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Scenarios
                  </Typography>
                  <Typography variant="h4">
                    {stats?.overview.active || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Automated
                  </Typography>
                  <Typography variant="h4">
                    {stats?.overview.automated || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Speed />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    End-Dated
                  </Typography>
                  <Typography variant="h4">
                    {stats?.overview.endDated || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Quick Actions */}
      <Grid container spacing={3}>
        {/* Module Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scenarios by Module
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.moduleStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="moduleFeature" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Scenario Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scenarios by Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.typeStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ scenarioType, percent }) => `${scenarioType} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats?.typeStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/test-scenarios')}
                  fullWidth
                >
                  Create Test Scenario
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={() => navigate('/test-plans')}
                  fullWidth
                >
                  Create Test Plan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayCircleOutline />}
                  onClick={() => navigate('/test-cycles')}
                  fullWidth
                >
                  Start Test Cycle
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BugReport />}
                  onClick={() => navigate('/defects')}
                  fullWidth
                >
                  Report Defect
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity?.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'grey.100' }}>
                          {getStatusIcon(activity.status || '')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography component="span" variant="body2" color="text.primary">
                              {activity.user}
                            </Typography>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {' • '}
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={activity.status}
                        color={getStatusColor(activity.status || '') as any}
                        size="small"
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Last Updated */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
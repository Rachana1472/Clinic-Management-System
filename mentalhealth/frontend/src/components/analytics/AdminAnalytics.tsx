import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AdminAnalyticsData {
  platformStats: {
    totalUsers: number;
    totalTherapists: number;
    totalAppointments: number;
    completedAppointments: number;
    totalRevenue: number;
    chatbotMessages: number;
  };
  userGrowth: {
    labels: string[];
    users: number[];
    therapists: number[];
  };
  revenueAnalytics: {
    labels: string[];
    revenue: number[];
    appointments: number[];
  };
  therapistStats: {
    verified: number;
    pending: number;
    active: number;
    inactive: number;
  };
  chatbotAnalytics: {
    totalMessages: number;
    escalationCount: number;
    moodDistribution: {
      labels: string[];
      data: number[];
    };
    topIntents: Array<{
      intent: string;
      count: number;
    }>;
  };
  appointmentStatus: {
    labels: string[];
    data: number[];
  };
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [platformResponse, chatbotResponse] = await Promise.all([
        adminAPI.getAnalytics({ period }),
        adminAPI.getChatbotAnalytics({ days: period === 'week' ? 7 : period === 'month' ? 30 : 365 })
      ]);
      
      setAnalyticsData({
        ...platformResponse.data,
        chatbotAnalytics: chatbotResponse.data
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary">
          No analytics data available
        </Typography>
      </Box>
    );
  }

  const userGrowthChartData = {
    labels: analyticsData?.userGrowth?.labels || [],
    datasets: [
      {
        label: 'Users',
        data: analyticsData?.userGrowth?.users || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Therapists',
        data: analyticsData?.userGrowth?.therapists || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const revenueChartData = {
    labels: analyticsData?.revenueAnalytics?.labels || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: analyticsData?.revenueAnalytics?.revenue || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const therapistStatsChartData = {
    labels: ['Verified', 'Pending', 'Active', 'Inactive'],
    datasets: [
      {
        data: [
          analyticsData?.therapistStats?.verified || 0,
          analyticsData?.therapistStats?.pending || 0,
          analyticsData?.therapistStats?.active || 0,
          analyticsData?.therapistStats?.inactive || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const moodDistributionChartData = {
    labels: analyticsData?.chatbotAnalytics?.moodDistribution?.labels || [],
    datasets: [
      {
        data: analyticsData?.chatbotAnalytics?.moodDistribution?.data || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const appointmentStatusChartData = {
    labels: analyticsData?.appointmentStatus?.labels || [],
    datasets: [
      {
        data: analyticsData?.appointmentStatus?.data || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Admin Analytics Dashboard</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Period"
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Platform Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" color="primary">
                {analyticsData.platformStats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Therapists
              </Typography>
              <Typography variant="h4" color="success.main">
                {analyticsData.platformStats.totalTherapists}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Appointments
              </Typography>
              <Typography variant="h4" color="info.main">
                {analyticsData.platformStats.totalAppointments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="warning.main">
                {analyticsData.platformStats.completedAppointments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="success.main">
                ${analyticsData.platformStats.totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Chatbot Messages
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {analyticsData.platformStats.chatbotMessages}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* User Growth */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              <Line data={userGrowthChartData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Analytics */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Analytics
              </Typography>
              <Bar data={revenueChartData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>

        {/* Therapist Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Therapist Statistics
              </Typography>
              <Box display="flex" justifyContent="center">
                <Box sx={{ width: '300px', height: '300px' }}>
                  <Doughnut data={therapistStatsChartData} options={chartOptions} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointment Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointment Status Distribution
              </Typography>
              <Box display="flex" justifyContent="center">
                <Box sx={{ width: '300px', height: '300px' }}>
                  <Doughnut data={appointmentStatusChartData} options={chartOptions} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chatbot Analytics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chatbot Mood Distribution
              </Typography>
              <Box display="flex" justifyContent="center">
                <Box sx={{ width: '300px', height: '300px' }}>
                  <Doughnut data={moodDistributionChartData} options={chartOptions} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Chatbot Intents */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Chatbot Intents
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Intent</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.chatbotAnalytics.topIntents.map((intent, index) => (
                      <TableRow key={index}>
                        <TableCell>{intent.intent}</TableCell>
                        <TableCell align="right">{intent.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics; 
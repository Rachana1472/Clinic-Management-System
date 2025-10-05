import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  People,
  Assessment,
  Settings,
  CheckCircle,
  Cancel,
  VerifiedUser
} from '@mui/icons-material';
import { therapistAPI } from '../../services/api';
import TherapistAnalytics from '../../components/analytics/TherapistAnalytics';
import TherapistProfile from '../../components/TherapistProfile';
import TherapistAvailability from '../../components/TherapistAvailability';
import toast from 'react-hot-toast';
import Rating from '@mui/material/Rating';

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  sessionType: string;
  sessionMode: string;
}

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedThisMonth: number;
  totalEarnings: number;
}

const TherapistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    loadAppointments();
    loadStats();
    loadReviews();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await therapistAPI.getAppointments();
      // Filter out appointments where the user has been deleted
      const validAppointments = response.data.appointments.filter((app: Appointment) => app.user);
      setAppointments(validAppointments);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await therapistAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    }
  };

  const loadReviews = async () => {
    try {
      const response = await therapistAPI.getReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      toast.error('Failed to load reviews');
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      await therapistAPI.updateAppointmentStatus(appointmentId, { status });
      toast.success('Appointment status updated successfully');
      loadAppointments();
      setStatusDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle color="success" />;
      case 'pending': return <Cancel color="error" />;
      case 'cancelled': return <Cancel color="error" />;
      case 'completed': return <CheckCircle color="info" />;
      default: return <Cancel />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'error';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Therapist Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Appointments
              </Typography>
              <Typography variant="h4">
                {stats?.totalAppointments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats?.pendingAppointments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed This Month
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats?.completedThisMonth || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Earnings
              </Typography>
              <Typography variant="h4" color="primary.main">
                ${stats?.totalEarnings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews & Ratings Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Recent Reviews & Ratings</Typography>
        {reviews.length === 0 ? (
          <Typography color="text.secondary">No reviews yet.</Typography>
        ) : (
          <List>
            {reviews.map((review) => (
              <React.Fragment key={review._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{review.user?.firstName?.[0]}{review.user?.lastName?.[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Unknown User'}
                    secondary={
                      <>
                        <Rating value={review.rating} readOnly size="small" />
                        {review.review && (
                          <Typography variant="body2" color="text.secondary">{review.review}</Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.date).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<People />} label="Appointments" />
        <Tab icon={<Settings />} label="Availability" />
        <Tab icon={<Assessment />} label="Analytics" />
        <Tab icon={<VerifiedUser />} label="Profile" />
      </Tabs>

      {/* Appointments Tab */}
      {activeTab === 0 && (
        <Box>
          {loading && <CircularProgress sx={{ mb: 2 }} />}
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Appointments
            </Typography>
            
            <List>
              {appointments.map((appointment) => (
                <React.Fragment key={appointment._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {getStatusIcon(appointment.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : 'Unknown User'}
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={appointment.status}
                              color={getStatusColor(appointment.status) as any}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={appointment.sessionType}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={appointment.sessionMode}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </>
                      }
                    />
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary">
                        ${appointment.amount}
                      </Typography>
                      {appointment.status === 'pending' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setStatusDialogOpen(true);
                          }}
                          sx={{ mt: 1 }}
                        >
                          Update Status
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Availability Tab */}
      {activeTab === 1 && (
        <Box>
          <TherapistAvailability />
        </Box>
      )}

      {/* Analytics Tab */}
      {activeTab === 2 && (
        <Box>
          <TherapistAnalytics />
        </Box>
      )}

      {/* Profile Tab */}
      {activeTab === 3 && (
        <Box>
          <TherapistProfile />
        </Box>
      )}

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Appointment Status
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to update the status for the appointment with{' '}
            <strong>{selectedAppointment?.user ? `${selectedAppointment.user.firstName} ${selectedAppointment.user.lastName}` : 'Deleted User'}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedAppointment) {
                handleStatusUpdate(selectedAppointment._id, 'confirmed');
              }
            }}
            color="success"
            variant="contained"
            disabled={!selectedAppointment}
          >
            Confirm
          </Button>
          <Button
            onClick={() => {
              if (selectedAppointment) {
                handleStatusUpdate(selectedAppointment._id, 'cancelled');
              }
            }}
            color="error"
            variant="contained"
            disabled={!selectedAppointment}
          >
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog
        open={availabilityDialogOpen}
        onClose={() => setAvailabilityDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Update Availability
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Availability management feature will be implemented in the next step.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvailabilityDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box>
              <Typography variant="h6">
                {selectedAppointment.user ? `${selectedAppointment.user.firstName} ${selectedAppointment.user.lastName}` : 'Unknown User'}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {selectedAppointment.user ? selectedAppointment.user.email : 'No email available'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {/* Other details... */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TherapistDashboard; 
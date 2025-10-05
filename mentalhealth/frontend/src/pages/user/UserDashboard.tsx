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
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { userAPI } from '../../services/api';
import AppointmentBooking from '../../components/AppointmentBooking';
import UserProfile from '../../components/UserProfile';
import toast from 'react-hot-toast';
import {
  Search,
  CalendarToday,
  Person,
  BookOnline
} from '@mui/icons-material';

interface Therapist {
  _id: string;
  firstName: string;
  lastName: string;
  specializations: string[];
  rating: number;
  hourlyRate: number;
  bio: string;
  experience: number;
  languages: string[];
}

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  therapist: {
    firstName: string;
    lastName: string;
    specializations: string[];
  };
  amount: number;
  rating?: number;
}

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    loadTherapists();
  }, [searchTerm, specializationFilter]);

  const loadAppointments = async () => {
    try {
      const response = await userAPI.getAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error('Failed to load appointments');
    }
  };

  const loadTherapists = async () => {
    try {
      const params = {
        search: searchTerm,
        specialization: specializationFilter
      };
      const response = await userAPI.getTherapists(params);
      setTherapists(response.data.therapists);
    } catch (error) {
      toast.error('Failed to load therapists');
    }
  };

  const handleBookAppointment = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setBookingDialogOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const handleBookingClose = () => {
    setBookingDialogOpen(false);
    setSelectedTherapist(null);
    // Reload appointments after booking
    loadAppointments();
  };

  const handleOpenRatingDialog = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setRatingValue(null);
    setReviewText('');
    setRatingDialogOpen(true);
  };

  const handleCloseRatingDialog = () => {
    setRatingDialogOpen(false);
    setSelectedAppointmentId(null);
    setRatingValue(null);
    setReviewText('');
  };

  const handleSubmitRating = async () => {
    if (!selectedAppointmentId || !ratingValue) return;
    setSubmitting(true);
    try {
      await userAPI.reviewAppointment(selectedAppointmentId, {
        rating: ratingValue,
        review: reviewText,
      });
      toast.success('Thank you for your feedback!');
      handleCloseRatingDialog();
      loadAppointments();
      loadTherapists();
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Your Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<Search />} label="Browse Therapists" />
        <Tab icon={<CalendarToday />} label="My Appointments" />
        <Tab icon={<Person />} label="Profile" />
      </Tabs>

      {/* Browse Therapists Tab */}
      {activeTab === 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  placeholder="Search therapists..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  sx={{ mr: 2 }}
                />
                <FormControl fullWidth>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    value={specializationFilter}
                    onChange={(e: any) => setSpecializationFilter(e.target.value)}
                    label="Specialization"
                  >
                    <MenuItem value="">All Specializations</MenuItem>
                    <MenuItem value="anxiety">Anxiety</MenuItem>
                    <MenuItem value="depression">Depression</MenuItem>
                    <MenuItem value="ptsd">PTSD</MenuItem>
                    <MenuItem value="addiction">Addiction</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            {therapists.map((therapist) => (
              <Grid item xs={12} md={6} lg={4} key={therapist._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {therapist.firstName[0]}{therapist.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Dr. {therapist.firstName} {therapist.lastName}
                        </Typography>
                        <Rating value={therapist.rating} readOnly size="small" />
                        {therapist.rating === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No ratings yet
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {therapist.bio.substring(0, 100)}...
                    </Typography>

                    <Box mb={2}>
                      {therapist.specializations.map((spec) => (
                        <Chip
                          key={spec}
                          label={spec}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="primary">
                        ${therapist.hourlyRate}/hr
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<BookOnline />}
                        onClick={() => handleBookAppointment(therapist)}
                      >
                        Book Session
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* My Appointments Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Appointments
          </Typography>
          
          {appointments.length > 0 ? (
            <List>
              {appointments.map((appointment) => (
                appointment.therapist && (
                  <React.Fragment key={appointment._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <CalendarToday />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Session with Dr. ${appointment.therapist.firstName} ${appointment.therapist.lastName}`}
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
                            </Typography>
                            <Chip
                              label={appointment.status}
                              color={getStatusColor(appointment.status) as any}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                            {/* Show Rate button if appointment is completed and not already rated */}
                            {appointment.status === 'completed' && !appointment.rating && (
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1, ml: 1 }}
                                onClick={() => handleOpenRatingDialog(appointment._id)}
                              >
                                Rate
                              </Button>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                )
              ))}
            </List>
          ) : (
            <Paper sx={{ textAlign: 'center', p: 4, mt: 2 }}>
              <Typography color="text.secondary">
                You have no upcoming or past appointments.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Profile Tab */}
      {activeTab === 2 && <UserProfile />}

      {/* Booking Dialog */}
      <AppointmentBooking
        open={bookingDialogOpen}
        onClose={handleBookingClose}
        therapist={selectedTherapist}
      />

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={handleCloseRatingDialog}>
        <DialogTitle>Rate Your Session</DialogTitle>
        <DialogContent>
          <Rating
            value={ratingValue}
            onChange={(_e, newValue) => setRatingValue(newValue)}
            size="large"
          />
          <TextField
            label="Write a review (optional)"
            multiline
            minRows={2}
            fullWidth
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRatingDialog} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmitRating} disabled={!ratingValue || submitting} variant="contained">
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard; 
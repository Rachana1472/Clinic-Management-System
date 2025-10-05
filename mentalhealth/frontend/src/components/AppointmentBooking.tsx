import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Therapist {
  _id: string;
  firstName: string;
  lastName: string;
  specializations: string[];
  rating: number;
  hourlyRate: number;
  bio: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface AppointmentBookingProps {
  open: boolean;
  onClose: () => void;
  therapist: Therapist | null;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  open,
  onClose,
  therapist
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [sessionType, setSessionType] = useState('individual');
  const [sessionMode, setSessionMode] = useState('video');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && therapist && selectedDate && selectedDate.isValid()) {
      loadAvailableSlots();
    }
  }, [open, therapist, selectedDate]);

  const loadAvailableSlots = async () => {
    if (!therapist || !selectedDate || !selectedDate.isValid()) return;

    try {
      setLoading(true);
      const response = await appointmentAPI.getAvailableSlots(
        therapist._id,
        selectedDate.format('YYYY-MM-DD')
      );
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      toast.error('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date && date.isValid()) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
    setSelectedTimeSlot(null);
  };

  const handleBookAppointment = async () => {
    if (!therapist || !selectedDate || !selectedDate.isValid() || !selectedTimeSlot) {
      toast.error('Please select a valid date and time slot');
      return;
    }

    try {
      setBookingLoading(true);
      const bookingData = {
        therapistId: therapist._id,
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: selectedTimeSlot.startTime,
        duration: parseInt(duration.toString()),
        sessionType,
        sessionMode,
        notes
      };

      await appointmentAPI.bookAppointment(bookingData);
      toast.success('Appointment booked successfully!');
      onClose();
      // Reset form
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSessionType('individual');
      setSessionMode('video');
      setDuration(60);
      setNotes('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to book appointment';
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateAmount = () => {
    if (!therapist) return 0;
    return (therapist.hourlyRate / 60) * duration;
  };

  const isDateValid = (date: Dayjs) => {
    return date && date.isValid() && (date.isAfter(dayjs(), 'day') || date.isSame(dayjs(), 'day'));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Book Session with Dr. {therapist?.firstName} {therapist?.lastName}
      </DialogTitle>
      <DialogContent>
        {therapist && (
          <Box>
            {/* Therapist Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dr. {therapist.firstName} {therapist.lastName}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {therapist.specializations.map((spec) => (
                    <Chip
                      key={spec}
                      label={spec}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Rate: ${therapist.hourlyRate}/hour
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              {/* Date Selection */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Select Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                    disablePast
                    shouldDisableDate={(day) => !isDateValid(day)}
                    slotProps={{
                      textField: {
                        helperText: 'Select a date for your appointment',
                        error: !!selectedDate && !selectedDate.isValid()
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Time Slots */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Available Time Slots
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                  </Box>
                ) : availableSlots.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <Grid container spacing={1}>
                      {availableSlots.map((slot, index) => (
                        <Grid item xs={6} key={index}>
                          <Button
                            variant={selectedTimeSlot === slot ? 'contained' : 'outlined'}
                            fullWidth
                            onClick={() => setSelectedTimeSlot(slot)}
                            sx={{ mb: 1 }}
                          >
                            {slot.startTime}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : selectedDate ? (
                  <Alert severity="info">
                    No available slots for this date. Please select another date.
                  </Alert>
                ) : (
                  <Alert severity="info">
                    Please select a date to view available time slots.
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Session Details */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Session Type</InputLabel>
                  <Select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    label="Session Type"
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="couple">Couple</MenuItem>
                    <MenuItem value="group">Group</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Session Mode</InputLabel>
                  <Select
                    value={sessionMode}
                    onChange={(e) => setSessionMode(e.target.value)}
                    label="Session Mode"
                  >
                    <MenuItem value="video">Video Call</MenuItem>
                    <MenuItem value="audio">Audio Call</MenuItem>
                    <MenuItem value="chat">Text Chat</MenuItem>
                    <MenuItem value="in-person">In-Person</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Duration (minutes)</InputLabel>
                  <Select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as number)}
                    label="Duration (minutes)"
                  >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={90}>1.5 hours</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific concerns or topics you'd like to discuss..."
                  sx={{ mb: 2 }}
                />

                <Card sx={{ bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Session Summary
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Duration: {duration} minutes
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Type: {sessionType}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Mode: {sessionMode}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      Total: ${calculateAmount()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleBookAppointment}
          disabled={!selectedDate || !selectedTimeSlot || bookingLoading}
        >
          {bookingLoading ? <CircularProgress size={20} /> : 'Book Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentBooking; 
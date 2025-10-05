import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Box,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { therapistAPI } from '../services/api';
import toast from 'react-hot-toast';

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const dayLabels: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

interface DayAvailability {
  start: string;
  end: string;
  available: boolean;
}

interface Availability {
  [key: string]: DayAvailability;
}

const defaultAvailability: Availability = {
  monday: { start: '09:00', end: '17:00', available: true },
  tuesday: { start: '09:00', end: '17:00', available: true },
  wednesday: { start: '09:00', end: '17:00', available: true },
  thursday: { start: '09:00', end: '17:00', available: true },
  friday: { start: '09:00', end: '17:00', available: true },
  saturday: { start: '10:00', end: '15:00', available: false },
  sunday: { start: '10:00', end: '15:00', available: false }
};

const TherapistAvailability: React.FC = () => {
  const [availability, setAvailability] = useState<Availability>(defaultAvailability);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const response = await therapistAPI.getProfile();
      if (response.data.availability) {
        setAvailability(response.data.availability);
      }
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available
      }
    }));
  };

  const handleTimeChange = (day: string, field: 'start' | 'end', value: Dayjs | null) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value ? value.format('HH:mm') : prev[day][field]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Convert object to array format for backend
      const availabilityArray = Object.entries(availability).map(([day, value]) => ({
        day,
        startTime: value.start,
        endTime: value.end,
        isAvailable: value.available
      }));
      await therapistAPI.updateAvailability({ availability: availabilityArray });
      toast.success('Availability updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update availability';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weekly Availability
        </Typography>
        <Grid container spacing={2}>
          {daysOfWeek.map((day) => (
            <Grid item xs={12} md={6} key={day}>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={availability[day].available}
                      onChange={() => handleToggle(day)}
                      color="primary"
                    />
                  }
                  label={dayLabels[day]}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Start"
                    value={dayjs(`2023-01-01T${availability[day].start}`)}
                    onChange={(value) => handleTimeChange(day, 'start', value)}
                    disabled={!availability[day].available}
                    ampm={false}
                    slotProps={{ textField: { size: 'small', sx: { width: 100 } } }}
                  />
                  <TimePicker
                    label="End"
                    value={dayjs(`2023-01-01T${availability[day].end}`)}
                    onChange={(value) => handleTimeChange(day, 'end', value)}
                    disabled={!availability[day].available}
                    ampm={false}
                    slotProps={{ textField: { size: 'small', sx: { width: 100, ml: 1 } } }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Save Availability'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TherapistAvailability; 
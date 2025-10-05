import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  IconButton,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Save, Edit, Cancel } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { therapistAPI } from '../services/api';
import toast from 'react-hot-toast';

interface TherapistProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  specializations: string[];
  hourlyRate: number;
  experience: number;
  education: string;
  license: string;
  languages: string[];
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
}

const specializations = [
  'Anxiety',
  'Depression',
  'Trauma',
  'Relationship Issues',
  'Addiction',
  'Eating Disorders',
  'PTSD',
  'OCD',
  'Bipolar Disorder',
  'Grief & Loss',
  'Stress Management',
  'Self-Esteem',
  'Anger Management',
  'Family Therapy',
  'Couples Therapy',
  'Child & Adolescent',
  'LGBTQ+ Support',
  'Career Counseling'
];

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Hindi',
  'Arabic',
  'Portuguese',
  'Russian',
  'Japanese'
];

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  bio: yup.string().min(50, 'Bio must be at least 50 characters').required('Bio is required'),
  specializations: yup.array().min(1, 'Select at least one specialization').required(),
  hourlyRate: yup.number().min(20, 'Minimum rate is $20').max(500, 'Maximum rate is $500').required(),
  experience: yup.number().min(0, 'Experience cannot be negative').required(),
  education: yup.string().required('Education is required'),
  license: yup.string().required('License number is required'),
  languages: yup.array().min(1, 'Select at least one language').required(),
  availability: yup.object().shape({
    monday: yup.object().shape({
      start: yup.string().required('Monday start time is required'),
      end: yup.string().required('Monday end time is required'),
      available: yup.bool().required('Monday availability is required')
    }),
    tuesday: yup.object().shape({
      start: yup.string().required('Tuesday start time is required'),
      end: yup.string().required('Tuesday end time is required'),
      available: yup.bool().required('Tuesday availability is required')
    }),
    wednesday: yup.object().shape({
      start: yup.string().required('Wednesday start time is required'),
      end: yup.string().required('Wednesday end time is required'),
      available: yup.bool().required('Wednesday availability is required')
    }),
    thursday: yup.object().shape({
      start: yup.string().required('Thursday start time is required'),
      end: yup.string().required('Thursday end time is required'),
      available: yup.bool().required('Thursday availability is required')
    }),
    friday: yup.object().shape({
      start: yup.string().required('Friday start time is required'),
      end: yup.string().required('Friday end time is required'),
      available: yup.bool().required('Friday availability is required')
    }),
    saturday: yup.object().shape({
      start: yup.string().required('Saturday start time is required'),
      end: yup.string().required('Saturday end time is required'),
      available: yup.bool().required('Saturday availability is required')
    }),
    sunday: yup.object().shape({
      start: yup.string().required('Sunday start time is required'),
      end: yup.string().required('Sunday end time is required'),
      available: yup.bool().required('Sunday availability is required')
    })
  })
});

const TherapistProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<TherapistProfileData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      specializations: [],
      hourlyRate: 100,
      experience: 0,
      education: '',
      license: '',
      languages: ['English'],
      availability: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '10:00', end: '15:00', available: false },
        sunday: { start: '10:00', end: '15:00', available: false }
      }
    }
  });

  const cleanData = (data: any): any => {
    if (data === null) return '';
    if (typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(cleanData);
    
    const cleaned: { [key: string]: any } = {};
    for (const key in data) {
      cleaned[key] = cleanData(data[key]);
    }
    return cleaned;
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await therapistAPI.getProfile();
      let profileData = response.data.therapist;

      // Ensure array fields are not null/undefined
      if (!profileData.specializations) {
        profileData.specializations = [];
      }
      if (!profileData.languages) {
        profileData.languages = [];
      }
      
      profileData = cleanData(profileData);

      reset(profileData);
      if (profileData.profileImage) {
        setProfileImage(profileData.profileImage);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: TherapistProfileData) => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      // Append profile data
      Object.keys(data).forEach(key => {
        if (key === 'availability') {
          formData.append(key, JSON.stringify(data[key as keyof TherapistProfileData]));
        } else {
          formData.append(key, JSON.stringify(data[key as keyof TherapistProfileData]));
        }
      });

      // Append image if changed
      if (profileImage && profileImage.startsWith('data:')) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        formData.append('profileImage', blob, 'profile.jpg');
      }

      await therapistAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile(); // Reset to original data
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Profile Settings</Typography>
        {!isEditing ? (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmit(onSubmit as any)}
              disabled={saving || !isDirty}
            >
              {saving ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      <form onSubmit={handleSubmit(onSubmit as any)}>
        <Grid container spacing={3}>
          {/* Profile Image */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box position="relative" display="inline-block">
                  <Avatar
                    src={profileImage || undefined}
                    sx={{ width: 150, height: 150, mb: 2 }}
                  />
                  {isEditing && (
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <PhotoCamera />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h6" gutterBottom>
                  Profile Photo
                </Typography>
                {isEditing && (
                  <Typography variant="body2" color="text.secondary">
                    Click the camera icon to upload a new photo
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name"
                          disabled={!isEditing}
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name"
                          disabled={!isEditing}
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          disabled={!isEditing}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Phone"
                          disabled={!isEditing}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Professional Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Professional Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          label="Bio"
                          disabled={!isEditing}
                          error={!!errors.bio}
                          helperText={errors.bio?.message}
                          placeholder="Tell clients about your background, approach, and expertise..."
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="specializations"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.specializations}>
                          <InputLabel>Specializations</InputLabel>
                          <Select
                            {...field}
                            multiple
                            disabled={!isEditing}
                            input={<OutlinedInput label="Specializations" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {specializations.map((spec) => (
                              <MenuItem key={spec} value={spec}>
                                {spec}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.specializations && (
                            <Typography variant="caption" color="error">
                              {errors.specializations.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="languages"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.languages}>
                          <InputLabel>Languages</InputLabel>
                          <Select
                            {...field}
                            multiple
                            disabled={!isEditing}
                            input={<OutlinedInput label="Languages" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {languages.map((lang) => (
                              <MenuItem key={lang} value={lang}>
                                {lang}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.languages && (
                            <Typography variant="caption" color="error">
                              {errors.languages.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="hourlyRate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Hourly Rate ($)"
                          type="number"
                          disabled={!isEditing}
                          error={!!errors.hourlyRate}
                          helperText={errors.hourlyRate?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="experience"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Years of Experience"
                          type="number"
                          disabled={!isEditing}
                          error={!!errors.experience}
                          helperText={errors.experience?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="license"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="License Number"
                          disabled={!isEditing}
                          error={!!errors.license}
                          helperText={errors.license?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="education"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Education & Certifications"
                          disabled={!isEditing}
                          error={!!errors.education}
                          helperText={errors.education?.message}
                          placeholder="e.g., PhD in Clinical Psychology, Licensed Clinical Social Worker..."
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default TherapistProfile; 
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  userType: yup.string().oneOf(['user', 'therapist'], 'Please select a user type').required('User type is required'),
  firstName: yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  phone: yup.string().optional(),
  // Therapist specific fields
  licenseNumber: yup.string().when('userType', {
    is: 'therapist',
    then: (schema) => schema.required('License number is required for therapists')
  }),
  specializations: yup.string().when('userType', {
    is: 'therapist',
    then: (schema) => schema.required('At least one specialization is required (comma-separated)')
  }),
  education: yup.array().when('userType', {
    is: 'therapist',
    then: (schema) => schema.of(
      yup.object({
        degree: yup.string().required('Degree is required'),
        institution: yup.string().required('Institution is required'),
        year: yup.number()
          .typeError('Year must be a number')
          .required('Year is required')
          .min(1950, 'Year must be after 1950')
          .max(new Date().getFullYear(), 'Year cannot be in the future'),
      })
    ).min(1, 'At least one education entry is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  languages: yup.string().when('userType', {
    is: 'therapist',
    then: (schema) => schema.required('At least one language is required (comma-separated)')
  }),
  experience: yup.number().when('userType', {
    is: 'therapist',
    then: (schema) => schema.min(0, 'Experience must be 0 or greater').required('Experience is required for therapists')
  }),
  bio: yup.string().when('userType', {
    is: 'therapist',
    then: (schema) => schema.min(50, 'Bio must be at least 50 characters').required('Bio is required for therapists')
  }),
  hourlyRate: yup.number().when('userType', {
    is: 'therapist',
    then: (schema) => schema.min(0, 'Hourly rate must be 0 or greater').required('Hourly rate is required for therapists')
  })
}).required();

type RegisterFormData = yup.InferType<typeof schema>;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      userType: 'user',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      licenseNumber: '',
      specializations: '',
      education: [],
      languages: '',
      experience: 0,
      bio: '',
      hourlyRate: 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education"
  });

  const watchedUserType = watch('userType');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');

    const submissionData = { ...data };

    try {
      if (submissionData.userType === 'user') {
        await authAPI.registerUser(submissionData);
      } else if (submissionData.userType === 'therapist') {
        const therapistData = {
          ...submissionData,
          specializations: submissionData.specializations?.split(',').map(s => s.trim()) || [],
          languages: submissionData.languages?.split(',').map(l => l.trim()) || [],
        };
        await authAPI.registerTherapist(therapistData);
      }

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      console.error('Registration Error Response:', err.response);
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data?.errors) {
        // Handle express-validator errors
        errorMessage = err.response.data.errors.map((e: any) => e.msg).join('; ');
      } else if (err.response?.data?.message) {
        // Handle other backend errors
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="userType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.userType}>
                  <InputLabel>User Type</InputLabel>
                  <Select {...field} label="User Type">
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="therapist">Therapist</MenuItem>
                  </Select>
                  {errors.userType && (
                    <Typography color="error" variant="caption">
                      {errors.userType.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

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
                      margin="normal"
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
                      margin="normal"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone (Optional)"
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type="password"
                      margin="normal"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      margin="normal"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Therapist-specific fields */}
            {watchedUserType === 'therapist' && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Professional Information
                </Typography>
                
                <Controller
                  name="licenseNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ''}
                      fullWidth
                      label="License Number"
                      margin="normal"
                      error={!!errors.licenseNumber}
                      helperText={errors.licenseNumber?.message}
                    />
                  )}
                />

                <Controller
                  name="specializations"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ''}
                      fullWidth
                      label="Specializations (comma-separated)"
                      margin="normal"
                      error={!!errors.specializations}
                      helperText={errors.specializations?.message}
                    />
                  )}
                />

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Education</Typography>
                {fields.map((item, index) => (
                  <Grid container spacing={2} key={item.id} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`education.${index}.degree`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Degree"
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`education.${index}.institution`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Institution"
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Controller
                        name={`education.${index}.year`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Year"
                            type="number"
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton onClick={() => remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  onClick={() => append({ degree: '', institution: '', year: new Date().getFullYear() })}
                >
                  Add Education
                </Button>
                {errors.education && typeof errors.education.message === 'string' && (
                  <Typography color="error" variant="caption">
                    {errors.education.message}
                  </Typography>
                )}

                <Controller
                  name="languages"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ''}
                      fullWidth
                      label="Languages (comma-separated)"
                      margin="normal"
                      error={!!errors.languages}
                      helperText={errors.languages?.message}
                    />
                  )}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="experience"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || 0}
                          fullWidth
                          label="Years of Experience"
                          type="number"
                          margin="normal"
                          error={!!errors.experience}
                          helperText={errors.experience?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="hourlyRate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value || 0}
                          fullWidth
                          label="Hourly Rate ($)"
                          type="number"
                          margin="normal"
                          error={!!errors.hourlyRate}
                          helperText={errors.hourlyRate?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ''}
                      fullWidth
                      label="Professional Bio"
                      multiline
                      rows={4}
                      margin="normal"
                      error={!!errors.bio}
                      helperText={errors.bio?.message}
                      placeholder="Tell us about your background, approach, and what makes you unique as a therapist..."
                    />
                  )}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Login here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 
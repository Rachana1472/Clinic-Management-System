import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Avatar,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  People,
  Psychology,
  Assessment,
  Notifications as NotificationsIcon,
  CheckCircle,
  Block,
  VerifiedUser,
  Edit,
  Delete,
  Visibility,
  Close
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import AdminAnalytics from '../../components/analytics/AdminAnalytics';
import Notifications from '../../components/Notifications';
import AdminSettings from '../../components/AdminSettings';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  userType: string;
}

interface Therapist {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  specializations: string[];
  hourlyRate: number;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDetails, setEditDetails] = useState<any>(null);
  const [editType, setEditType] = useState<'user' | 'therapist' | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'user' | 'therapist' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if(activeTab === 0) {
      loadUsersAndTherapists();
    }
  }, [activeTab]);

  const loadUsersAndTherapists = async () => {
    setLoading(true);
    try {
      const [usersResponse, therapistsResponse] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getTherapists()
      ]);
      setUsers(usersResponse.data.users);
      setTherapists(therapistsResponse.data.therapists);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTherapist = async (therapistId: string) => {
    try {
      await adminAPI.verifyTherapist(therapistId);
      toast.success('Therapist verified successfully');
      loadUsersAndTherapists();
    } catch (error) {
      toast.error('Failed to verify therapist');
    }
  };

  const handleToggleUserStatus = async (userId: string, userType: string) => {
    try {
      await adminAPI.toggleUserStatus(userId, userType);
      toast.success('User status updated successfully');
      loadUsersAndTherapists();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredUsers = users.filter(user => 
      (user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!statusFilter || (statusFilter === 'active' ? user.isActive : !user.isActive))
  );

  const filteredTherapists = therapists.filter(therapist => 
      (therapist.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       therapist.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       therapist.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!statusFilter || (statusFilter === 'active' ? therapist.isActive : !therapist.isActive))
  );
  
  // Placeholder handlers for new actions
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u._id === userId);
    setEditDetails({ ...user });
    setEditType('user');
    setEditDialogOpen(true);
  };
  const handleViewUser = (userId: string) => {
    const user = users.find(u => u._id === userId);
    setViewDetails(user);
    setViewDialogOpen(true);
  };
  const handleDeleteUser = (userId: string) => {
    setDeleteType('user');
    setDeleteId(userId);
    setDeleteDialogOpen(true);
  };
  const handleEditTherapist = (therapistId: string) => {
    const therapist = therapists.find(t => t._id === therapistId);
    setEditDetails({ ...therapist });
    setEditType('therapist');
    setEditDialogOpen(true);
  };
  const handleViewTherapist = (therapistId: string) => {
    const therapist = therapists.find(t => t._id === therapistId);
    setViewDetails(therapist);
    setViewDialogOpen(true);
  };
  const handleDeleteTherapist = (therapistId: string) => {
    setDeleteType('therapist');
    setDeleteId(therapistId);
    setDeleteDialogOpen(true);
  };
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewDetails(null);
  };
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditDetails(null);
    setEditType(null);
  };
  const handleEditChange = (field: string, value: any) => {
    setEditDetails((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleSaveEdit = async () => {
    if (!editDetails || !editType) return;
    setEditLoading(true);
    try {
      if (editType === 'user') {
        await adminAPI.updateUser(editDetails._id, editDetails);
      } else if (editType === 'therapist') {
        await adminAPI.updateTherapist(editDetails._id, editDetails);
      }
      toast.success('Details updated successfully');
      handleCloseEditDialog();
      loadUsersAndTherapists();
    } catch (error) {
      toast.error('Failed to update details');
    } finally {
      setEditLoading(false);
    }
  };
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteType(null);
    setDeleteId(null);
  };
  const handleConfirmDelete = async () => {
    if (!deleteId || !deleteType) return;
    setDeleteLoading(true);
    try {
      if (deleteType === 'user') {
        await adminAPI.deleteUser(deleteId);
      } else if (deleteType === 'therapist') {
        await adminAPI.deleteTherapist(deleteId);
      }
      toast.success('Deleted successfully');
      handleCloseDeleteDialog();
      loadUsersAndTherapists();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<People />} label="Users" />
        <Tab icon={<Assessment />} label="Analytics" />
        <Tab icon={<NotificationsIcon />} label="Notifications" />
        <Tab icon={<Psychology />} label="Settings" />
      </Tabs>

      {/* User Management Tab */}
      {activeTab === 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  sx={{ mr: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>User Type</InputLabel>
                  <Select
                    value={userTypeFilter}
                    onChange={(e: any) => setUserTypeFilter(e.target.value)}
                    label="User Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="user">Users</MenuItem>
                    <MenuItem value="therapist">Therapists</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {userTypeFilter !== 'therapist' && (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Users</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>{user.firstName[0]}{user.lastName[0]}</Avatar>
                            <Typography>{user.firstName} {user.lastName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'error'} size="small" />
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleToggleUserStatus(user._id, 'user')} title={user.isActive ? 'Deactivate' : 'Activate'}>
                            {user.isActive ? <Block /> : <CheckCircle />}
                          </IconButton>
                          <IconButton onClick={() => handleEditUser(user._id)} title="Edit">
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleViewUser(user._id)} title="View">
                            <Visibility />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteUser(user._id)} title="Delete">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {userTypeFilter !== 'user' && (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Therapists</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Therapist</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Verification</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTherapists.map((therapist) => (
                      <TableRow key={therapist._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>{therapist.firstName[0]}{therapist.lastName[0]}</Avatar>
                            <Typography>{therapist.firstName} {therapist.lastName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{therapist.email}</TableCell>
                        <TableCell>
                          <Chip label={therapist.isActive ? 'Active' : 'Inactive'} color={therapist.isActive ? 'success' : 'error'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={therapist.isVerified ? 'Verified' : 'Pending'} color={therapist.isVerified ? 'success' : 'warning'} size="small" />
                        </TableCell>
                        <TableCell>{new Date(therapist.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {!therapist.isVerified && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => handleVerifyTherapist(therapist._id)}
                              startIcon={<VerifiedUser />}
                              title="Verify"
                            >
                              Verify
                            </Button>
                          )}
                          <IconButton onClick={() => handleToggleUserStatus(therapist._id, 'therapist')} title={therapist.isActive ? 'Deactivate' : 'Activate'}>
                            {therapist.isActive ? <Block /> : <CheckCircle />}
                          </IconButton>
                          <IconButton onClick={() => handleEditTherapist(therapist._id)} title="Edit">
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleViewTherapist(therapist._id)} title="View">
                            <Visibility />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteTherapist(therapist._id)} title="Delete">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {/* Analytics Tab */}
      {activeTab === 1 && <AdminAnalytics />}

      {/* Notifications Tab */}
      {activeTab === 2 && <Notifications />}

      {/* Settings Tab */}
      {activeTab === 3 && <AdminSettings />}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Details
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewDetails ? (
            <Box>
              {Object.entries(viewDetails).map(([key, value]) => (
                <Box key={key} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{key}</Typography>
                  <Typography variant="body2" color="text.secondary">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography>No details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {editType === 'user' ? 'User' : 'Therapist'}
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editDetails ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(editDetails).map(([key, value]) => (
                key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'password' && (
                  <TextField
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={typeof value === 'object' ? JSON.stringify(value) : value}
                    onChange={e => handleEditChange(key, e.target.value)}
                    fullWidth
                    disabled={key === 'email'}
                  />
                )
              ))}
            </Box>
          ) : (
            <DialogContentText>No details available.</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit} disabled={editLoading} variant="contained">
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {deleteType}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 
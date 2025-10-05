import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('You have been logged out.');
    navigate('/login');
    // We need to force a re-render or reload to update the header state across the app
    window.location.reload();
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Mental Wellness
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user.firstName || user.email} ({user.userType})
              </Typography>
              
              {/* Common Links */}
              {(user.userType === 'user' || user.userType === 'therapist' || user.userType === 'admin') && 
                <Button component={Link} to="/chatbot" color="inherit">AI Chatbot</Button>
              }

              {/* Role-specific Links */}
              {user.userType === 'admin' && <Button component={Link} to="/admin" color="inherit">Admin Panel</Button>}
              {user.userType === 'therapist' && <Button component={Link} to="/therapist" color="inherit">Therapist Panel</Button>}
              {user.userType === 'user' && <Button component={Link} to="/user" color="inherit">User Panel</Button>}
              
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" color="inherit">Login</Button>
              <Button component={Link} to="/register" color="inherit">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
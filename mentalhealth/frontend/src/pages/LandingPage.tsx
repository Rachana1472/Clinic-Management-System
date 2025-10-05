import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Typography, Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';

// Create a custom theme for the landing page
const landingTheme = createTheme({
  palette: {
    primary: {
      main: '#0d9488', // A calming, rich teal
    },
    secondary: {
      main: '#52525b', // A soft, neutral gray for text
    },
    background: {
      default: '#f8fafc', // A very light, clean background
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h2: {
      fontWeight: 800,
      color: '#1e293b', // A deep slate for the heading for strong contrast
    },
    h6: {
      color: '#475569', // A softer slate for the subheading
    },
  },
});

const LandingPage: React.FC = () => {
  return (
    <ThemeProvider theme={landingTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {/* Navbar */}
        <Box component="nav" sx={{ bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Container
            sx={{
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
              Mental Wellness
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
              <Button component={Link} to="/" color="secondary">Home</Button>
              <Button component={Link} to="/login" color="secondary">Therapists</Button>
              <Button component={Link} to="/login" variant="contained" disableElevation sx={{ borderRadius: '20px', px: 3 }}>
                Login
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Hero Section */}
        <Container
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box className="animate-fade-in-up" sx={{ maxWidth: 'lg', py: 8 }}>
            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              Your Journey to Peace Starts Here
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, maxWidth: 'md', margin: 'auto' }}>
              Speak to a therapist, chat with our AI, or explore resources designed to help you feel better.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  px: 5,
                  borderRadius: '50px',
                  boxShadow: '0 4px 20px rgba(13, 148, 136, 0.25)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 25px rgba(13, 148, 136, 0.3)' },
                }}
              >
                Get Started
              </Button>
              <Button
                component={Link}
                to="/chatbot"
                variant="outlined"
                size="large"
                sx={{
                  py: 1.5,
                  px: 5,
                  borderRadius: '50px',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                Talk to AI Assistant
              </Button>
            </Box>
          </Box>
        </Container>
        
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
          
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out .2s forwards;
            opacity: 0;
          }
        `}</style>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage; 
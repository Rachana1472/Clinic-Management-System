import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './Header';

// Create a custom light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3a8dff', // A calm, friendly blue
    },
    secondary: {
      main: '#5a698f', // A soft, secondary color
    },
    background: {
      default: '#f8f9fa', // A very light grey for a soft background
      paper: '#ffffff',
    },
    text: {
      primary: '#212529', // Dark, soft charcoal for primary text
      secondary: '#6c757d', // A lighter grey for secondary text
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Header />
      <main>{children}</main>
    </ThemeProvider>
  );
};

export default MainLayout; 
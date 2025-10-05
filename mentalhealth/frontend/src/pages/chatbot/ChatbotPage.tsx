import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import {
  SmartToy,
  Psychology,
  Support,
  OpenInNew,
  Security,
  Warning,
  Close
} from '@mui/icons-material';
import AIChatbot from '../../components/AIChatbot';

const ChatbotPage: React.FC = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const features = [
    {
      title: '24/7 Support',
      description: 'Get immediate emotional support anytime, anywhere',
      icon: <Support sx={{ fontSize: 40 }} />
    },
    {
      title: 'Confidential',
      description: 'Your conversations are private and secure',
      icon: <Security sx={{ fontSize: 40 }} />
    },
    {
      title: 'Evidence-Based',
      description: 'Responses based on mental health best practices',
      icon: <Psychology sx={{ fontSize: 40 }} />
    },
    {
      title: 'Crisis Detection',
      description: 'Automated detection of crisis situations',
      icon: <Warning sx={{ fontSize: 40 }} />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          AI Mental Wellness Assistant
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Your compassionate AI companion for mental health support and guidance
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<SmartToy />}
          onClick={() => setChatbotOpen(true)}
          sx={{ mt: 2 }}
        >
          Start Chat
        </Button>
      </Box>

      <Grid container spacing={4} mb={6}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box mb={2}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" gutterBottom>
                1
              </Typography>
              <Typography variant="h6" gutterBottom>
                Start a Conversation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the chat button and begin talking about your concerns
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" gutterBottom>
                2
              </Typography>
              <Typography variant="h6" gutterBottom>
                Get Personalized Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receive tailored advice and coping strategies based on your situation
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" gutterBottom>
                3
              </Typography>
              <Typography variant="h6" gutterBottom>
                Access Resources
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get connected to helpful resources and professional help when needed
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h5" gutterBottom>
          Important Information
        </Typography>
        <Typography variant="body1" paragraph>
          This AI assistant is designed to provide general mental health support and information. 
          It is not a substitute for professional medical advice, diagnosis, or treatment.
        </Typography>
        <Typography variant="body1" paragraph>
          If you are experiencing a mental health crisis or having thoughts of self-harm, 
          please contact emergency services or a mental health professional immediately.
        </Typography>
        <Box mt={2}>
          <Button
            variant="outlined"
            startIcon={<OpenInNew />}
            href="https://988lifeline.org/"
            target="_blank"
            sx={{ mr: 2 }}
          >
            National Suicide Prevention Lifeline
          </Button>
          <Button
            variant="outlined"
            startIcon={<OpenInNew />}
            href="https://www.crisistextline.org/"
            target="_blank"
          >
            Crisis Text Line
          </Button>
        </Box>
      </Paper>

      {/* Floating Action Button for quick access */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => setChatbotOpen(true)}
      >
        <SmartToy />
      </Fab>

      {/* AI Chatbot Dialog */}
      <Dialog 
        open={chatbotOpen} 
        onClose={() => setChatbotOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            height: '80vh'
          }
        }}
      >
        <DialogTitle>
          AI Mental Wellness Assistant
          <IconButton
            aria-label="close"
            onClick={() => setChatbotOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <AIChatbot />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ChatbotPage; 
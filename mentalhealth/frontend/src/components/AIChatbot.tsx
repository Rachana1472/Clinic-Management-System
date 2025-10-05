import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Avatar
} from '@mui/material';
import { 
  Send, 
  SmartToy, 
  Person
} from '@mui/icons-material';
import { chatbotAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ChatMessage {
  _id: string;
  sender: 'user' | 'ai';
  message: string;
}

const AIChatbot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      _id: `user-${Date.now()}`,
      sender: 'user',
      message: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage({
        message: currentInput,
        sessionId: sessionId,
      });

      const { aiMessage, sessionId: newSessionId } = response.data;
      
      const formattedAiMessage: ChatMessage = {
        _id: aiMessage._id,
        sender: aiMessage.messageType,
        message: aiMessage.message
      };

      setMessages((prev) => [...prev, formattedAiMessage]);
      
      if (!sessionId) {
        setSessionId(newSessionId);
      }
    } catch (err: any) {
      console.error("Chatbot API error:", err.response || err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map((e: any) => e.msg).join(', ');
        }
      }
      
      toast.error(errorMessage);
       const errorResponseMessage: ChatMessage = {
        _id: `error-${Date.now()}`,
        sender: 'ai',
        message: `Sorry, an error occurred: ${errorMessage}`,
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ flex: 1, p: 2, mb: 2, overflow: 'auto', bgcolor: 'grey.50' }}>
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Ask me anything about mental wellness.
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((msg) => (
              <ListItem key={msg._id} sx={{
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                p: 0,
                mb: 1
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  <Avatar sx={{
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main',
                    ml: msg.sender === 'user' ? 1 : 0,
                    mr: msg.sender === 'user' ? 0 : 1,
                    width: 32,
                    height: 32
                  }}>
                    {msg.sender === 'user' ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
                  </Avatar>
                  <Box sx={{ maxWidth: '80%' }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: msg.sender === 'user' ? 'primary.light' : 'background.paper',
                        color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: '16px'
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                    </Paper>
                  </Box>
                </Box>
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ justifyContent: 'flex-start', p: 0, mb: 1 }}>
                 <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'row' }}>
                   <Avatar sx={{ bgcolor: 'secondary.main', mr: 1, width: 32, height: 32 }}>
                     <SmartToy fontSize="small" />
                   </Avatar>
                   <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '16px' }}>
                     <CircularProgress size={20} />
                   </Paper>
                 </Box>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && !loading) handleSend(); }}
          disabled={loading}
          autoFocus
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AIChatbot; 
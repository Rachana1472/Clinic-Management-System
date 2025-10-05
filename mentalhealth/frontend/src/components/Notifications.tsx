import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface INotification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <React.Fragment key={notification._id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={notification.message}
                  secondary={`${formatDistanceToNow(new Date(notification.createdAt))} ago`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={notification.type} size="small" />
                  {!notification.read && (
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </Box>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <Typography sx={{ textAlign: 'center', p: 4 }}>
            You have no notifications.
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default Notifications; 
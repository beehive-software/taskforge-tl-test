import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { styled } from '@mui/material/styles';

import { getToken } from '../../utils/auth';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#1976d2',
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.5px',
  textDecoration: 'none',
  color: 'white',
}));

const Header = ({ user, onLogout, toggleSidebar }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  const notifications = [
    {
      id: 1,
      message: 'Task "Design homepage mockup" is due soon',
      read: false,
    },
    {
      id: 2,
      message: 'John Smith commented on your task',
      read: true,
    },
    {
      id: 3,
      message: 'You were added to project "Marketing Campaign"',
      read: false,
    },
  ];
  
  // Calculate unread notification count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Event handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };
  
  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };
  
  const handleLogout = () => {
    onLogout();
    handleMenuClose();
    navigate('/login');
  };
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // This should update state in a context or redux store
      console.log(`Marked notification ${notificationId} as read`);
      handleNotificationMenuClose();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <RouterLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Logo variant="h6" component="div">
              TaskForge
            </Logo>
          </RouterLink>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationMenuOpen}
              aria-label="notifications"
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User menu */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title="Account">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                aria-label="account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                {user?.profile_picture ? (
                  <Avatar 
                    alt={`${user.first_name} ${user.last_name}`} 
                    src={user.profile_picture}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
      
      {/* User menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfile}>
          <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications menu */}
      <Menu
        id="notification-menu"
        anchorEl={notificationAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: 320,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{ 
                bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                whiteSpace: 'normal'
              }}
            >
              <Typography variant="body2">{notification.message}</Typography>
            </MenuItem>
          ))
        )}
        {notifications.length > 0 && (
          <>
            <Divider />
            <MenuItem 
              onClick={handleNotificationMenuClose}
              sx={{ justifyContent: 'center' }}
            >
              <Typography variant="body2" color="primary">
                View all notifications
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </StyledAppBar>
  );
};

export default Header;
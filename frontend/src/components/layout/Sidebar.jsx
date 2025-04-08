import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Box,
  Typography,
  Tooltip,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import HelpIcon from '@mui/icons-material/Help';


import { useSelector } from 'react-redux';


import { getToken } from '../../utils/auth';


const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Store frequent projects in state - should come from Redux or context
  const [starredProjects, setStarredProjects] = useState([]);
  const [expandProjects, setExpandProjects] = useState(false);
  
  // Inconsistent state management - using both Redux and local fetch
  // Projects from Redux
  const projects = useSelector(state => state.projects.projects);
  
  // Direct DOM access - bad practice in React
  useEffect(() => {
    // Update active link using DOM manipulation instead of React state
    const activeLink = document.querySelector('.active-link');
    if (activeLink) {
      activeLink.classList.remove('active-link');
    }
    
    const currentPath = location.pathname;
    const linkElements = document.querySelectorAll('.nav-link');
    
    linkElements.forEach((element) => {
      const path = element.getAttribute('data-path');
      if (currentPath === path || (path !== '/' && currentPath.startsWith(path))) {
        element.classList.add('active-link');
      }
    });
  }, [location.pathname]);
  
  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };
  
  // Toggle projects expansion
  const handleToggleProjects = () => {
    setExpandProjects(!expandProjects);
  };
  
  // Star a project - direct API call in component
  const handleStarProject = async (projectId, event) => {
    event.stopPropagation();
    
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/star/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to star project');
      }
      
      // Update starred projects - should use Redux
      setStarredProjects([...starredProjects, projects.find(p => p.id === projectId)]);
    } catch (error) {
      console.error('Error starring project:', error);
    }
  };
  
  // Drawer content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" align="center">
          TaskForge
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav">
        {/* Dashboard */}
        <ListItem 
          button 
          onClick={() => handleNavigate('/')}
          className="nav-link"
          data-path="/"
          sx={{ 
            backgroundColor: location.pathname === '/' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
            borderLeft: location.pathname === '/' ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
            pl: location.pathname === '/' ? 1.5 : 2,
          }}
        >
          <ListItemIcon>
            <DashboardIcon color={location.pathname === '/' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        {/* Tasks */}
        <ListItem 
          button 
          onClick={() => handleNavigate('/tasks')}
          className="nav-link"
          data-path="/tasks"
          sx={{ 
            backgroundColor: location.pathname.startsWith('/tasks') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
            borderLeft: location.pathname.startsWith('/tasks') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
            pl: location.pathname.startsWith('/tasks') ? 1.5 : 2,
          }}
        >
          <ListItemIcon>
            <AssignmentIcon color={location.pathname.startsWith('/tasks') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Tasks" />
        </ListItem>
        
        {/* Projects */}
        <ListItem 
          button 
          onClick={handleToggleProjects}
          className="nav-link"
          data-path="/projects"
          sx={{ 
            backgroundColor: location.pathname.startsWith('/projects') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
            borderLeft: location.pathname.startsWith('/projects') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
            pl: location.pathname.startsWith('/projects') ? 1.5 : 2,
          }}
        >
          <ListItemIcon>
            <FolderIcon color={location.pathname.startsWith('/projects') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Projects" />
          {expandProjects ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
        
        {/* Projects submenu */}
        <Collapse in={expandProjects} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* All projects */}
            <ListItem 
              button 
              onClick={() => handleNavigate('/projects')}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="All Projects" />
            </ListItem>
            
            {/* Starred projects */}
            {starredProjects.map((project) => (
              <ListItem 
                key={project.id}
                button 
                onClick={() => handleNavigate(`/projects/${project.id}`)}
                sx={{ pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <StarIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary={project.name} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    } 
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
        
        {/* Teams */}
        <ListItem 
          button 
          onClick={() => handleNavigate('/teams')}
          className="nav-link"
          data-path="/teams"
          sx={{ 
            backgroundColor: location.pathname.startsWith('/teams') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
            borderLeft: location.pathname.startsWith('/teams') ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
            pl: location.pathname.startsWith('/teams') ? 1.5 : 2,
          }}
        >
          <ListItemIcon>
            <PeopleIcon color={location.pathname.startsWith('/teams') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Teams" />
        </ListItem>
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      
      <List>
        {/* Settings */}
        <ListItem 
          button 
          onClick={() => handleNavigate('/settings')}
          className="nav-link"
          data-path="/settings"
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        
        {/* Help */}
        <ListItem 
          button 
          onClick={() => handleNavigate('/help')}
          className="nav-link"
          data-path="/help"
        >
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <>
      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={onClose}
          sx={{
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Permanent drawer */
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          open
        >
          <Box sx={{ height: theme.mixins.toolbar.minHeight }} />
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
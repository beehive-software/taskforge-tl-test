import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Chip, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';


import { getToken } from '../../utils/auth';


const StyledCard = styled(Card)(({ theme, status }) => ({
  marginBottom: 16,
  borderLeft: `4px solid ${getStatusColor(status)}`,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
}));


function getStatusColor(status) {
  switch (status) {
    case 'TODO':
      return '#ff9800';
    case 'IN_PROGRESS':
      return '#2196f3';
    case 'REVIEW':
      return '#9c27b0';
    case 'DONE':
      return '#4caf50';
    default:
      return '#e0e0e0';
  }
}


const statusDisplay = {
  'TODO': 'To Do',
  'IN_PROGRESS': 'In Progress',
  'REVIEW': 'In Review',
  'DONE': 'Done',
};


function getPriorityLabel(priority) {
  const priorities = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
  };
  return priorities[priority] || 'Medium';
}

function getPriorityColor(priority) {
  switch (priority) {
    case 1:
      return '#8bc34a';
    case 2:
      return '#ffeb3b';
    case 3:
      return '#ff9800';
    case 4:
      return '#f44336';
    default:
      return '#e0e0e0';
  }
}

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Direct date manipulation - should use a library
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Event handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleViewTask = () => {
    navigate(`/tasks/${task.id}`);
    handleMenuClose();
  };
  
  const handleEditTask = () => {
    navigate(`/tasks/${task.id}/edit`);
    handleMenuClose();
  };
  
  // Direct API call in component - should be in context or service
  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/tasks/${task.id}/mark_complete/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark task as complete');
      }
      
      // Update through callback
      onUpdate({ ...task, status: 'DONE', completed: true });
    } catch (error) {
      console.error('Error marking task complete:', error);
      alert('Failed to mark task as complete.');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };
  
  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
    handleMenuClose();
  };
  
  // Check if task is overdue - duplicated logic that should be in utils
  const isOverdue = () => {
    if (!task.due_date || task.status === 'DONE') return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate < today;
  };
  
  return (
    <StyledCard status={task.status}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Typography variant="h6" component="h2">
              {task.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Project: {task.project_name || 'Unknown project'}
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
              <Chip 
                label={statusDisplay[task.status]} 
                size="small" 
                style={{ 
                  backgroundColor: getStatusColor(task.status),
                  color: '#fff',
                  marginRight: 8
                }} 
              />
              <Chip 
                label={getPriorityLabel(task.priority)} 
                size="small" 
                style={{ 
                  backgroundColor: getPriorityColor(task.priority),
                  color: task.priority >= 3 ? '#fff' : '#000'
                }} 
              />
              {isOverdue() && (
                <Chip 
                  icon={<AccessTimeIcon />} 
                  label="Overdue" 
                  size="small" 
                  color="error" 
                  style={{ marginLeft: 8 }} 
                />
              )}
            </div>
            <Typography variant="body2" color="textSecondary">
              Due: {formatDueDate(task.due_date)}
            </Typography>
          </div>
          <div>
            <IconButton aria-label="task actions" onClick={handleMenuOpen} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleViewTask}>View Details</MenuItem>
              <MenuItem onClick={handleEditTask}>
                <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                Edit
              </MenuItem>
              {task.status !== 'DONE' && (
                <MenuItem onClick={handleMarkComplete} disabled={loading}>
                  <CheckCircleIcon fontSize="small" style={{ marginRight: 8 }} />
                  Mark Complete
                </MenuItem>
              )}
              <MenuItem onClick={handleDeleteTask}>
                <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                Delete
              </MenuItem>
            </Menu>
          </div>
        </div>
        
        {task.description && (
          <Typography variant="body2" style={{ marginTop: 8 }}>
            {/* Only show first 100 characters of description */}
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description}
          </Typography>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          {task.assignee ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={task.assignee_avatar} 
                style={{ width: 24, height: 24, marginRight: 8 }}
              >
                {task.assignee_name ? task.assignee_name.charAt(0) : '?'}
              </Avatar>
              <Typography variant="body2">
                {task.assignee_name || 'Unknown User'}
              </Typography>
            </div>
          ) : (
            <Button 
              startIcon={<AssignmentIndIcon />} 
              size="small" 
              variant="outlined"
              onClick={() => alert('Assign functionality not implemented')}
            >
              Assign
            </Button>
          )}
          
          <Button 
            size="small" 
            color="primary" 
            onClick={handleViewTask}
          >
            View
          </Button>
        </div>
      </CardContent>
    </StyledCard>
  );
};




/*
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};
*/

export default TaskItem;
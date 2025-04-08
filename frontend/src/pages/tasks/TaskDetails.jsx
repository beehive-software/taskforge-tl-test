import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  IconButton,
  Chip,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  Tooltip,
  Link,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';


import { TaskContext } from '../../context/TaskContext';


import { useSelector } from 'react-redux';


import { getToken } from '../../utils/auth';
import { 
  TASK_STATUS, 
  TASK_STATUS_DISPLAY, 
  TASK_PRIORITY, 
  TASK_PRIORITY_DISPLAY, 
  STATUS_COLORS,
  PRIORITY_COLORS,
} from '../../config/constants';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Using context - inconsistent with project details using Redux
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    updateTask,
    deleteTask,
    markTaskComplete,
  } = useContext(TaskContext);
  
  // Get all projects from Redux
  const projects = useSelector(state => state.projects.projects);
  
  // Get current task
  const task = tasks.find(t => t.id === id);
  
  // Local state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: 0,
    due_date: '',
    assignee: '',
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Current project
  const project = task ? projects.find(p => p.id === task.project) : null;
  
  // Fetch task comments - direct API call in component
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      
      setLoadingComments(true);
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/api/tasks/${id}/comments/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };
    
    fetchComments();
  }, [id]);
  
  // Fetch users - direct API call in component
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/api/accounts/users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.results || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Set edit form when task is loaded
  useEffect(() => {
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assignee: task.assignee || '',
      });
    }
  }, [task]);
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle edit mode toggle
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    handleMenuClose();
  };
  
  // Handle open delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle open assignee dialog
  const handleOpenAssigneeDialog = () => {
    setAssigneeDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle close assignee dialog
  const handleCloseAssigneeDialog = () => {
    setAssigneeDialogOpen(false);
  };
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle priority as a number
    if (name === 'priority') {
      setEditForm({
        ...editForm,
        [name]: parseInt(value, 10),
      });
    } else {
      setEditForm({
        ...editForm,
        [name]: value,
      });
    }
  };
  
  // Handle save task
  const handleSaveTask = async () => {
    try {
      await updateTask(id, editForm);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };
  
  // Handle delete task
  const handleDeleteTask = async () => {
    try {
      await deleteTask(id);
      handleCloseDeleteDialog();
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };
  
  // Handle mark as complete
  const handleMarkComplete = async () => {
    try {
      await markTaskComplete(id);
      handleMenuClose();
    } catch (error) {
      console.error('Error marking task as complete:', error);
      alert('Failed to mark task as complete');
    }
  };
  
  // Handle assign task
  const handleAssignTask = async (userId) => {
    try {
      // Direct API call - should use context or Redux action
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/tasks/${id}/assign/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign task');
      }
      
      // Update local state
      await updateTask(id, { ...editForm, assignee: userId });
      handleCloseAssigneeDialog();
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task');
    }
  };
  
  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // Direct API call - should use context or Redux action
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/tasks/${id}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const data = await response.json();
      
      // Update comments
      setComments([...comments, data]);
      
      // Clear comment field
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Check if task is overdue
  const isOverdue = () => {
    if (!task || !task.due_date || task.status === 'DONE') {
      return false;
    }
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    return dueDate < today;
  };
  
  if (tasksLoading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (tasksError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{tasksError}</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }
  
  if (!task) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Task not found</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            {editMode ? (
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={editForm.title}
                onChange={handleFormChange}
                sx={{ mb: 2 }}
              />
            ) : (
              <>
                <Typography variant="h4" component="h1" gutterBottom>
                  {task.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={TASK_STATUS_DISPLAY[task.status]} 
                    size="small" 
                    sx={{ 
                      bgcolor: STATUS_COLORS[task.status],
                      color: '#fff'
                    }} 
                  />
                  
                  <Chip 
                    label={TASK_PRIORITY_DISPLAY[task.priority]} 
                    size="small" 
                    icon={<FlagIcon />}
                    sx={{ 
                      bgcolor: PRIORITY_COLORS[task.priority],
                      color: task.priority >= 3 ? '#fff' : '#000'
                    }} 
                  />
                  
                  {isOverdue() && (
                    <Chip 
                      label="Overdue" 
                      size="small" 
                      color="error" 
                    />
                  )}
                  
                  {task.completed && (
                    <Chip 
                      label="Completed" 
                      size="small" 
                      color="success" 
                      icon={<CheckCircleIcon />}
                    />
                  )}
                </Box>
              </>
            )}
            
            {editMode ? (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      name="status"
                      value={editForm.status}
                      onChange={handleFormChange}
                    >
                      {Object.entries(TASK_STATUS_DISPLAY).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Priority"
                      name="priority"
                      value={editForm.priority}
                      onChange={handleFormChange}
                    >
                      {Object.entries(TASK_PRIORITY_DISPLAY).map(([value, label]) => (
                        <MenuItem key={value} value={parseInt(value, 10)}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Due Date"
                      name="due_date"
                      type="date"
                      value={editForm.due_date}
                      onChange={handleFormChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
              </>
            ) : (
              <>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Project
                    </Typography>
                    <Typography variant="body1">
                      {project ? (
                        <Link 
                          component="button" 
                          variant="body1"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          {project.name}
                        </Link>
                      ) : 'Unknown project'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(task.due_date)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Assignee
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {task.assignee ? (
                        <>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            {task.assignee_name ? task.assignee_name.charAt(0) : 'U'}
                          </Avatar>
                          <Typography variant="body1">
                            {task.assignee_name || 'Unknown user'}
                          </Typography>
                        </>
                      ) : (
                        <Button 
                          startIcon={<PersonIcon />}
                          size="small"
                          onClick={handleOpenAssigneeDialog}
                        >
                          Assign
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                
                {task.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {task.description}
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created by {task.creator_email || 'Unknown'} on {formatDateTime(task.created_at)}
                  </Typography>
                  {task.updated_at !== task.created_at && (
                    <Typography variant="body2" color="text.secondary">
                      Last updated: {formatDateTime(task.updated_at)}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
          
          <Box>
            <IconButton
              aria-label="task actions"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleToggleEditMode}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                {editMode ? 'Cancel Edit' : 'Edit Task'}
              </MenuItem>
              
              {!task.completed && (
                <MenuItem onClick={handleMarkComplete}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                  Mark Complete
                </MenuItem>
              )}
              
              {!task.assignee && (
                <MenuItem onClick={handleOpenAssigneeDialog}>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  Assign Task
                </MenuItem>
              )}
              
              <MenuItem onClick={handleOpenDeleteDialog}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete Task
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {editMode && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => setEditMode(false)} 
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveTask}
            >
              Save
            </Button>
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {loadingComments ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <List>
            {comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar>
                    {comment.author_email ? comment.author_email.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">
                        {comment.author_email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(comment.created_at)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                    >
                      {comment.content}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Avatar sx={{ mr: 2 }}>
            {/* Current user avatar - hardcoded first letter */}
            U
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                startIcon={<AttachFileIcon />}
                disabled
              >
                Attach
              </Button>
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                disabled={!newComment.trim()}
                onClick={handleAddComment}
              >
                Comment
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Delete Task Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTask} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Assign Task Dialog */}
      <Dialog open={assigneeDialogOpen} onClose={handleCloseAssigneeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Typography>No users found</Typography>
          ) : (
            <List sx={{ pt: 0 }}>
              {users.map((user) => (
                <ListItem 
                  button 
                  key={user.id}
                  onClick={() => handleAssignTask(user.id)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${user.first_name} ${user.last_name}`.trim() || user.email} 
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssigneeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskDetails;
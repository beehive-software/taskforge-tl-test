import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Paper,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PersonAddIcon from '@mui/icons-material/PersonAdd';


import { useDispatch, useSelector } from 'react-redux';
import { useContext } from 'react';
import { TaskContext } from '../../context/TaskContext';


import { 
  fetchProjectById, 
  updateProject, 
  deleteProject, 
  archiveProject 
} from '../../store/actions/projectActions';


import { getToken } from '../../utils/auth';
import { PROJECT_API, PROJECT_STATUS_DISPLAY } from '../../config/constants';


import TaskItem from '../../components/tasks/TaskItem';


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Project from Redux
  const project = useSelector(state => 
    state.projects.projects.find(p => p.id === id)
  );
  const loading = useSelector(state => state.projects.loading);
  const error = useSelector(state => state.projects.error);
  
  // Tasks from Context - inconsistent state management
  const { tasks, updateTask, deleteTask } = useContext(TaskContext);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectActivities, setProjectActivities] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 0,
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');
  const [isStarred, setIsStarred] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  // Filter project tasks - inefficient filtering in component
  const projectTasks = tasks.filter(task => task.project === id);
  
  // Fetch project details if not in Redux store
  useEffect(() => {
    if (!project) {
      dispatch(fetchProjectById(id));
    } else {
      // Set form data when project is available
      setEditForm({
        name: project.name,
        description: project.description || '',
        status: project.status,
      });
    }
  }, [dispatch, id, project]);
  
  // Fetch project members - direct API call in component
  useEffect(() => {
    const fetchProjectMembers = async () => {
      setLoadingMembers(true);
      try {
        const token = getToken();
        const response = await fetch(PROJECT_API.MEMBERS(id), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch project members');
        }
        
        const data = await response.json();
        setProjectMembers(data);
      } catch (error) {
        console.error('Error fetching project members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };
    
    if (id) {
      fetchProjectMembers();
    }
  }, [id]);
  
  // Fetch project activities - another direct API call
  useEffect(() => {
    const fetchProjectActivities = async () => {
      setLoadingActivities(true);
      try {
        const token = getToken();
        const response = await fetch(PROJECT_API.ACTIVITIES(id), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch project activities');
        }
        
        const data = await response.json();
        setProjectActivities(data.activities || []);
      } catch (error) {
        console.error('Error fetching project activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };
    
    if (id && tabValue === 2) {
      fetchProjectActivities();
    }
  }, [id, tabValue]);
  
  // Check if project is starred - another direct API call
  useEffect(() => {
    const checkStarredStatus = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${PROJECT_API.DETAIL(id)}/starred/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch starred status');
        }
        
        const data = await response.json();
        setIsStarred(data.starred);
      } catch (error) {
        console.error('Error checking starred status:', error);
      }
    };
    
    if (id) {
      checkStarredStatus();
    }
  }, [id]);
  
  // Handle tab change
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle open edit dialog
  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
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
  
  // Handle open add member dialog
  const handleOpenAddMemberDialog = () => {
    setAddMemberDialogOpen(true);
  };
  
  // Handle close add member dialog
  const handleCloseAddMemberDialog = () => {
    setAddMemberDialogOpen(false);
    setNewMemberEmail('');
    setNewMemberRole('MEMBER');
  };
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'status' ? parseInt(value, 10) : value,
    });
  };
  
  // Handle save project
  const handleSaveProject = async () => {
    try {
      await dispatch(updateProject(id, editForm));
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    }
  };
  
  // Handle delete project
  const handleDeleteProject = async () => {
    try {
      await dispatch(deleteProject(id));
      handleCloseDeleteDialog();
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };
  
  // Handle archive project
  const handleArchiveProject = async () => {
    try {
      await dispatch(archiveProject(id));
      handleMenuClose();
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('Failed to archive project');
    }
  };
  
  // Handle add member - direct API call
  const handleAddMember = async () => {
    try {
      const token = getToken();
      const response = await fetch(PROJECT_API.MEMBERS(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }
      
      // Refetch members
      const membersResponse = await fetch(PROJECT_API.MEMBERS(id), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!membersResponse.ok) {
        throw new Error('Failed to fetch project members');
      }
      
      const membersData = await membersResponse.json();
      setProjectMembers(membersData);
      
      handleCloseAddMemberDialog();
    } catch (error) {
      console.error('Error adding member:', error);
      alert(`Failed to add member: ${error.message}`);
    }
  };
  
  // Handle toggle star - another direct API call
  const handleToggleStar = async () => {
    try {
      const token = getToken();
      const url = `${PROJECT_API.DETAIL(id)}/${isStarred ? 'unstar' : 'star'}/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isStarred ? 'unstar' : 'star'} project`);
      }
      
      setIsStarred(!isStarred);
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };
  
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => dispatch(fetchProjectById(id))}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }
  
  if (!project) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Project not found</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              {project.name}
            </Typography>
            
            <IconButton 
              onClick={handleToggleStar}
              color={isStarred ? 'warning' : 'default'}
              sx={{ ml: 1 }}
            >
              {isStarred ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip 
              label={PROJECT_STATUS_DISPLAY[project.status]} 
              color={project.status === 0 ? 'primary' : 'default'}
              size="small"
              sx={{ mr: 1 }}
            />
            
            {project.is_archived && (
              <Chip label="Archived" color="default" size="small" />
            )}
          </Box>
          
          {project.description && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              {project.description}
            </Typography>
          )}
        </Box>
        
        <Box>
          <IconButton
            aria-label="project actions"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleOpenEditDialog}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit Project
            </MenuItem>
            <MenuItem onClick={handleArchiveProject} disabled={project.is_archived}>
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
              Archive Project
            </MenuItem>
            <MenuItem onClick={handleOpenDeleteDialog}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Project
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChangeTab} aria-label="project tabs">
            <Tab label="Tasks" />
            <Tab label="Members" />
            <Tab label="Activity" />
          </Tabs>
        </Box>
        
        {/* Tasks tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Project Tasks
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/tasks/new?project=${id}`)}
            >
              Add Task
            </Button>
          </Box>
          
          {projectTasks.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No tasks found for this project. Create your first task!
              </Typography>
            </Paper>
          ) : (
            projectTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </TabPanel>
        
        {/* Members tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Project Members
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddMemberDialog}
            >
              Add Member
            </Button>
          </Box>
          
          {loadingMembers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : projectMembers.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No members found for this project.
              </Typography>
            </Paper>
          ) : (
            <List>
              {projectMembers.map((member) => (
                <ListItem key={member.id}>
                  <Avatar sx={{ mr: 2 }}>
                    {member.user.first_name ? member.user.first_name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <ListItemText 
                    primary={`${member.user.first_name} ${member.user.last_name}`.trim() || member.user.email}
                    secondary={`${member.role} • Joined ${new Date(member.joined_date).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
        
        {/* Activity tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Project Activity
          </Typography>
          
          {loadingActivities ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : projectActivities.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No activities recorded for this project.
              </Typography>
            </Paper>
          ) : (
            <List>
              {projectActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemText 
                    primary={activity.description}
                    secondary={`${activity.user} • ${new Date(activity.date).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Box>
      
      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Project Name"
            type="text"
            fullWidth
            required
            value={editForm.name}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={editForm.description}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            value={editForm.status}
            onChange={handleFormChange}
          >
            {Object.entries(PROJECT_STATUS_DISPLAY).map(([value, label]) => (
              <MenuItem key={value} value={parseInt(value, 10)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            All tasks associated with this project will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteProject} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onClose={handleCloseAddMemberDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            required
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            margin="dense"
            label="Role"
            fullWidth
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
          >
            <MenuItem value="OWNER">Owner</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="MEMBER">Member</MenuItem>
            <MenuItem value="VIEWER">Viewer</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddMemberDialog}>Cancel</Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained" 
            color="primary"
            disabled={!newMemberEmail}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetails;
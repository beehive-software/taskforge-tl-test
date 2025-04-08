import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';


import { 
  fetchProjects, 
  addProject, 
  updateProject, 
  deleteProject, 
  archiveProject 
} from '../../store/actions/projectActions';


import { 
  getProjects, 
  getProjectsLoading, 
  getProjectsError 
} from '../../store/reducers/projectReducer';

const ProjectsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const projects = useSelector(getProjects);
  const loading = useSelector(getProjectsLoading);
  const error = useSelector(getProjectsError);
  
  // Local state - mixing Redux and local state
  const [openDialog, setOpenDialog] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  useEffect(() => {
    // Fetch projects on component mount
    dispatch(fetchProjects());
  }, [dispatch]);
  
  // Event handlers
  const handleOpenMenu = (event, projectId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProjectId(projectId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedProjectId(null);
  };
  
  const handleOpenDialog = (project = null) => {
    if (project) {
      setProjectForm({
        name: project.name,
        description: project.description || '',
      });
      setEditMode(true);
      setCurrentProjectId(project.id);
    } else {
      setProjectForm({
        name: '',
        description: '',
      });
      setEditMode(false);
      setCurrentProjectId(null);
    }
    setOpenDialog(true);
    handleCloseMenu();
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setProjectForm({
      name: '',
      description: '',
    });
    setEditMode(false);
    setCurrentProjectId(null);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm({
      ...projectForm,
      [name]: value,
    });
  };
  
  // Form submission - inconsistent error handling
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await dispatch(updateProject(currentProjectId, projectForm));
      } else {
        await dispatch(addProject(projectForm));
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting project:', err);
      alert(`Failed to ${editMode ? 'update' : 'create'} project: ${err.message}`);
    }
  };
  
  // Direct API call through Redux action
  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteProject(selectedProjectId));
        handleCloseMenu();
      } catch (err) {
        console.error('Error deleting project:', err);
        alert(`Failed to delete project: ${err.message}`);
      }
    }
  };
  
  // Direct API call through Redux action
  const handleArchiveProject = async () => {
    try {
      await dispatch(archiveProject(selectedProjectId));
      handleCloseMenu();
    } catch (err) {
      console.error('Error archiving project:', err);
      alert(`Failed to archive project: ${err.message}`);
    }
  };
  
  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };
  
  if (loading && projects.length === 0) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error && projects.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => dispatch(fetchProjects())}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Project
        </Button>
      </Box>
      
      {projects.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No projects found. Create your first project to get started!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2">
                      {project.name}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleOpenMenu(e, project.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  {project.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {project.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    {project.is_archived && (
                      <Chip label="Archived" size="small" color="default" sx={{ mr: 1 }} />
                    )}
                    {/* Hard-coded task count - should be in project data */}
                    <Chip label={`${project.task_count || 0} Tasks`} size="small" color="primary" />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleViewProject(project.id)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Project menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem 
          onClick={() => {
            handleOpenDialog(projects.find(p => p.id === selectedProjectId));
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleArchiveProject}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleDeleteProject}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Project form dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <form onSubmit={handleSubmitProject}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Project Name"
              type="text"
              fullWidth
              required
              value={projectForm.name}
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
              value={projectForm.description}
              onChange={handleFormChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ProjectsList;
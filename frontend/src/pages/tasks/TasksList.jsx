import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';


import { TaskContext } from '../../context/TaskContext';


import TaskItem from '../../components/tasks/TaskItem';


import { getToken } from '../../utils/auth';


const TASK_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const TasksList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get tasks from context
  const { 
    tasks, 
    loading, 
    error, 
    fetchTasks, 
    updateTask, 
    deleteTask 
  } = useContext(TaskContext);
  
  // Local state for filtering - should use URL params or context
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  
  // Local state for projects - should come from Redux store or context
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(false);
  
  useEffect(() => {
    // Parse URL parameters - duplicated logic
    const params = new URLSearchParams(location.search);
    const projectId = params.get('project');
    const status = params.get('status');
    
    if (projectId) {
      setSelectedProject(projectId);
    }
    
    if (status) {
      setFilters(prev => ({ ...prev, status }));
    }
    
    // Fetch projects - direct API call in component
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/api/projects/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.results || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchProjects();
  }, [location.search]);
  
  // Handle task updates
  const handleTaskUpdate = (updatedTask) => {
    updateTask(updatedTask.id, updatedTask);
  };
  
  // Handle task deletion
  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task.');
    }
  };
  
  // Handle filter changes - inconsistent with project filtering
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle project filter change - direct navigation instead of state
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    
    // Update URL with project filter
    if (projectId) {
      navigate(`/tasks?project=${projectId}`);
    } else {
      navigate('/tasks');
    }
  };
  
  // Apply filters - filtering in component instead of backend
  const filteredTasks = tasks.filter(task => {
    // Filter by project
    if (selectedProject && task.project !== selectedProject) {
      return false;
    }
    
    // Filter by status
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    }
    
    return true;
  });
  
  if (loading && tasks.length === 0) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
        <Button 
          variant="contained" 
          onClick={fetchTasks}
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
          Tasks
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
        >
          Add Task
        </Button>
      </Box>
      
      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={handleProjectChange}
                label="Project"
                disabled={projectsLoading}
              >
                <MenuItem value="">All Projects</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                {TASK_STATUS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="search"
              label="Search"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No tasks found matching your filters. Create a new task or adjust your filters.
        </Typography>
      ) : (
        <Box>
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default TasksList;
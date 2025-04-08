import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';


import { useSelector, useDispatch } from 'react-redux';
import { TaskContext } from '../context/TaskContext';


import { fetchProjects } from '../store/actions/projectActions';


import { getToken } from '../utils/auth';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_COLORS = {
  'TODO': '#ff9800',
  'IN_PROGRESS': '#2196f3',
  'REVIEW': '#9c27b0',
  'DONE': '#4caf50',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Mixing Redux and Context API
  const { tasks } = useContext(TaskContext);
  const projects = useSelector(state => state.projects.projects);
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState([]);
  const [projectStats, setProjectStats] = useState([]);
  
  useEffect(() => {
    dispatch(fetchProjects()).then((response) => {
      setLoading(false);
    });
  }, [dispatch]);
  
  // Add a separate useEffect for processing tasks and projects
  const processTasksAndProjects = useCallback(() => {
    // Process tasks by status for pie chart
    const statusCounts = {
      'TODO': 0,
      'IN_PROGRESS': 0,
      'REVIEW': 0,
      'DONE': 0,
    };
    
    tasks.forEach(task => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }
    });
    
    const statusData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
    }));
    
    setTasksByStatus(statusData);
    
    // Process project stats for bar chart
    const projectData = projects.map(project => {
      const projectTasks = tasks.filter(task => task.project === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'DONE').length;
      
      return {
        name: project.name,
        total: projectTasks.length,
        completed: completedTasks,
        completion: projectTasks.length ? (completedTasks / projectTasks.length * 100).toFixed(0) : 0,
      };
    });
    
    setProjectStats(projectData);
  }, [tasks, projects]);
  
  useEffect(() => {
    processTasksAndProjects();
  }, [processTasksAndProjects]);
  
  // Direct DOM manipulation - bad practice in React
  useEffect(() => {
    // Update task count element with JavaScript
    const taskCountElement = document.getElementById('task-count');
    if (taskCountElement) {
      taskCountElement.textContent = tasks.length.toString();
    }
    
    // Update project count element with JavaScript
    const projectCountElement = document.getElementById('project-count');
    if (projectCountElement) {
      projectCountElement.textContent = projects.length.toString();
    }
  }, [tasks, projects]);
  
  // Format date - duplicate logic from TaskItem
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Inefficient calculation - should be memoized
  const calculateCompletionRate = () => {
    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    if (tasks.length === 0) return 0;
    return (completedTasks / tasks.length * 100).toFixed(0);
  };
  
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">Total Tasks</Typography>
            <Typography variant="h3" id="task-count">{tasks.length}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">Projects</Typography>
            <Typography variant="h3" id="project-count">{projects.length}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">Completion Rate</Typography>
            <Typography variant="h3">{calculateCompletionRate()}%</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">Overdue Tasks</Typography>
            <Typography variant="h3" color="error">{overdueTasks.length}</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Task Status Chart and Project Progress */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tasks by Status</Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              {tasksByStatus.some(item => item.value > 0) ? (
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1">No task data available</Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Project Progress</Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              {projectStats.length > 0 ? (
                <BarChart
                  data={projectStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Tasks" fill="#8884d8" />
                  <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                </BarChart>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1">No project data available</Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Overdue and Upcoming Tasks */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                Overdue Tasks
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {overdueTasks.length === 0 ? (
                <Typography variant="body1">No overdue tasks</Typography>
              ) : (
                <List>
                  {overdueTasks.map((task) => (
                    <ListItem 
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Due: {formatDate(task.due_date)}
                            </Typography>
                            <Chip 
                              label={task.status} 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                bgcolor: STATUS_COLORS[task.status],
                                color: '#fff'
                              }} 
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                Upcoming Tasks
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {upcomingTasks.length === 0 ? (
                <Typography variant="body1">No upcoming tasks</Typography>
              ) : (
                <List>
                  {upcomingTasks.map((task) => (
                    <ListItem 
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Due: {formatDate(task.due_date)}
                            </Typography>
                            <Chip 
                              label={task.status} 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                bgcolor: STATUS_COLORS[task.status],
                                color: '#fff'
                              }} 
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Actions Section */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mx: 1 }}
          onClick={() => navigate('/projects/new')}
        >
          Create New Project
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          sx={{ mx: 1 }}
          onClick={() => navigate('/tasks/new')}
        >
          Add New Task
        </Button>
      </Box>
      
      {/* Direct DOM manipulation - setting up a chart (bad practice) */}
      <div id="task-completion-chart" style={{ display: 'none' }}></div>
      <script dangerouslySetInnerHTML={{
        __html: `
          // This script will never execute in React
          document.addEventListener('DOMContentLoaded', function() {
            const chart = document.getElementById('task-completion-chart');
            // Chart setup code...
          });
        `
      }} />
    </Container>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store/store'; // You'll need to make sure this path is correct


import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';


import Dashboard from './pages/Dashboard';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetails from './pages/projects/ProjectDetails';
import TasksList from './pages/tasks/TasksList';
import TaskDetails from './pages/tasks/TaskDetails';


import { TaskContext } from './context/TaskContext';


import { getToken, getUserFromToken } from './utils/auth';
import { apiRequest } from './utils/api';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  // State management mixed between Context and local state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Direct API call in component - should be in a service
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const user = getUserFromToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        // Use the new apiRequest helper
        apiRequest('http://localhost:8000/api/tasks/')
          .then(response => response.json())
          .then(data => {
            setTasks(data.results);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching tasks:', error);
            setLoading(false);
          });
      } catch (error) {
        // Invalid token
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);
  
  // Authentication logic in component - should be in context or provider
  const login = (token, user) => {
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Protected route component - duplicated logic
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TaskContext.Provider value={{ tasks, setTasks }}>
          <Router>
            {isAuthenticated && <Header user={user} onLogout={logout} />}
            <div style={{ display: 'flex' }}>
              {isAuthenticated && <Sidebar />}
              <div style={{ flexGrow: 1, padding: '20px' }}>
                <Routes>
                  <Route path="/login" element={<LoginPage onLogin={login} />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route 
                    path="/" 
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/projects" 
                    element={
                      <PrivateRoute>
                        <ProjectsList />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/projects/:id" 
                    element={
                      <PrivateRoute>
                        <ProjectDetails />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/tasks" 
                    element={
                      <PrivateRoute>
                        <TasksList />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/tasks/:id" 
                    element={
                      <PrivateRoute>
                        <TaskDetails />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </div>
            </div>
          </Router>
        </TaskContext.Provider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
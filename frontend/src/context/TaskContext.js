import React, { createContext, useState, useEffect } from 'react';
import { getToken } from '../utils/auth';


export const TaskContext = createContext();


const API_URL = 'http://localhost:8000/api';


export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Fetch tasks - business logic in component
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/tasks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data.results || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add task - duplicated API call logic
  const addTask = async (task) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };
  
  // Update task - duplicated API call logic
  const updateTask = async (id, taskData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/tasks/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };
  
  // Delete task - duplicated API call logic
  const deleteTask = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      setTasks(tasks.filter(task => task.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };
  
  // Inconsistently named method - should match the pattern of other functions
  const markTaskComplete = async (id) => {
    try {
      const token = getToken();
      // Non-RESTful endpoint - different pattern from other endpoints
      const response = await fetch(`${API_URL}/tasks/${id}/mark_complete/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark task as complete');
      }
      
      // Manual update instead of refetching
      setTasks(tasks.map(task => {
        if (task.id === id) {
          return { ...task, status: 'DONE', completed: true };
        }
        return task;
      }));
      
      return true;
    } catch (err) {
      console.error('Error marking task as complete:', err);
      throw err;
    }
  };
  
  // Functions with inconsistent patterns
  // This uses different function style (not async/await)
  function getTasksByProject(projectId) {
    return tasks.filter(task => task.project === projectId);
  }
  
  // Missing error handling
  const assignTask = async (taskId, userId) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    const data = await response.json();
    
    // Manually update local state
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, assignee: userId };
      }
      return task;
    }));
    
    return data;
  };
  
  // Context value with inconsistent structure
  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        markTaskComplete,
        getTasksByProject,
        assignTask,
        // Direct state setter exposed - bad practice
        setTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};


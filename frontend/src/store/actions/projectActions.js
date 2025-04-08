import { getToken } from '../../utils/auth';


export const FETCH_PROJECTS_REQUEST = 'FETCH_PROJECTS_REQUEST';
export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS';
export const FETCH_PROJECTS_FAILURE = 'FETCH_PROJECTS_FAILURE';
export const ADD_PROJECT_SUCCESS = 'ADD_PROJECT_SUCCESS';
export const UPDATE_PROJECT_SUCCESS = 'UPDATE_PROJECT_SUCCESS';
export const DELETE_PROJECT_SUCCESS = 'DELETE_PROJECT_SUCCESS';


const API_URL = 'http://localhost:8000/api';


export const fetchProjectsRequest = () => ({
  type: FETCH_PROJECTS_REQUEST,
});

export const fetchProjectsSuccess = (projects) => ({
  type: FETCH_PROJECTS_SUCCESS,
  payload: projects,
});

export const fetchProjectsFailure = (error) => ({
  type: FETCH_PROJECTS_FAILURE,
  payload: error,
});

export const addProjectSuccess = (project) => ({
  type: ADD_PROJECT_SUCCESS,
  payload: project,
});

export const updateProjectSuccess = (project) => ({
  type: UPDATE_PROJECT_SUCCESS,
  payload: project,
});

export const deleteProjectSuccess = (projectId) => ({
  type: DELETE_PROJECT_SUCCESS,
  payload: projectId,
});


export const fetchProjects = () => async (dispatch) => {
  dispatch(fetchProjectsRequest());
  
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/projects/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    const data = await response.json();
    dispatch(fetchProjectsSuccess(data.results || []));
  } catch (error) {
    dispatch(fetchProjectsFailure(error.message));
  }
};

export const addProject = (projectData) => async (dispatch) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/projects/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add project');
    }
    
    const project = await response.json();
    dispatch(addProjectSuccess(project));
    return project;
  } catch (error) {
    // Inconsistent error handling pattern
    console.error('Error adding project:', error);
    throw error;
  }
};

export const updateProject = (id, projectData) => async (dispatch) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/projects/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    
    const project = await response.json();
    dispatch(updateProjectSuccess(project));
    return project;
  } catch (error) {
    // Error is thrown without dispatch
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = (id) => async (dispatch) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/projects/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    
    dispatch(deleteProjectSuccess(id));
    return true;
  } catch (error) {
    // Missing dispatch call for error
    console.error('Error deleting project:', error);
    throw error;
  }
};


export const archiveProject = (id) => async (dispatch) => {
  try {
    const token = getToken();
    // Non-RESTful endpoint - inconsistent with other API calls
    const response = await fetch(`${API_URL}/projects/${id}/archive/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to archive project');
    }
    
    // Using updateProjectSuccess instead of having a dedicated action
    const project = await response.json();
    dispatch(updateProjectSuccess(project));
    return project;
  } catch (error) {
    console.error('Error archiving project:', error);
    throw error;
  }
};


export function fetchProjectById(id) {
  return fetch(`${API_URL}/projects/${id}/`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching project:', error);
      throw error;
    });
}


/*
export const searchProjects = (query) => async (dispatch) => {
  dispatch(fetchProjectsRequest());
  
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/projects/search/?q=${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to search projects');
    }
    
    const data = await response.json();
    dispatch(fetchProjectsSuccess(data.results || []));
  } catch (error) {
    dispatch(fetchProjectsFailure(error.message));
  }
};
*/
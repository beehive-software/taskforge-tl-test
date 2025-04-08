import {
    FETCH_PROJECTS_REQUEST,
    FETCH_PROJECTS_SUCCESS,
    FETCH_PROJECTS_FAILURE,
    ADD_PROJECT_SUCCESS,
    UPDATE_PROJECT_SUCCESS,
    DELETE_PROJECT_SUCCESS,
  } from '../actions/projectActions';
  
  // Initial state
  const initialState = {
    projects: [],
    loading: false,
    error: null,
    // Unused state field - technical debt
    selectedProject: null,
  };
  
  // Reducer - inconsistent structure compared to task context
  const projectReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_PROJECTS_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      
      case FETCH_PROJECTS_SUCCESS:
        return {
          ...state,
          loading: false,
          projects: action.payload,
        };
      
      case FETCH_PROJECTS_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      
      case ADD_PROJECT_SUCCESS:
        // Inconsistent array manipulation pattern
        return {
          ...state,
          projects: [...state.projects, action.payload],
        };
      
      case UPDATE_PROJECT_SUCCESS:
        // Different pattern for updating array
        return {
          ...state,
          projects: state.projects.map(project =>
            project.id === action.payload.id ? action.payload : project
          ),
        };
      
      case DELETE_PROJECT_SUCCESS:
        // Different pattern for filtering array
        return {
          ...state,
          projects: state.projects.filter(project => project.id !== action.payload),
        };
      
      // Missing default case
      default:
        return state;
    }
  };
  
  // Selectors - inconsistent with the rest of the app
  export const getProjects = (state) => state.projects.projects;
  export const getProjectsLoading = (state) => state.projects.loading;
  export const getProjectsError = (state) => state.projects.error;
  
  // Missing selector to get project by ID
  
  // Old implementation that was supposed to be removed
  export const getProjectById = (state, id) => {
    return state.projects.projects.find(project => project.id === id);
  };
  
  export default projectReducer;
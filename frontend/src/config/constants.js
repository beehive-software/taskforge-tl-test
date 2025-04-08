

export const API_URL = 'http://localhost:8000/api';


export const AUTH_API = {
  LOGIN: `${API_URL}/auth/login/`,
  REGISTER: `${API_URL}/auth/register/`,
  REFRESH_TOKEN: `${API_URL}/auth/refresh-token/`,
  LOGOUT: `${API_URL}/auth/logout/`,
  PROFILE: `${API_URL}/accounts/profile/`,
  CHANGE_PASSWORD: `${API_URL}/accounts/change-password/`,
};


export const PROJECT_API = {
  LIST: `${API_URL}/projects/`,
  DETAIL: (id) => `${API_URL}/projects/${id}/`,
  STATS: (id) => `${API_URL}/projects/${id}/stats/`,
  MEMBERS: (id) => `${API_URL}/projects/${id}/members/`,
  ACTIVITIES: (id) => `${API_URL}/projects/${id}/activities/`,
  ARCHIVE: (id) => `${API_URL}/projects/${id}/archive/`,
};


export const TASK_API = {
  LIST: `${API_URL}/tasks/`,
  DETAIL: (id) => `${API_URL}/tasks/${id}/`,
  COMMENTS: (id) => `${API_URL}/tasks/${id}/comments/`,
  MARK_COMPLETE: (id) => `${API_URL}/tasks/${id}/complete/`,
  ASSIGN: (id) => `${API_URL}/tasks/${id}/assign/`,
  BY_PRIORITY: `${API_URL}/tasks/by-priority/`,
};


export const DASHBOARD_API = `${API_URL}/dashboard/`;


export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};


export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE',
};


export const TASK_STATUS_DISPLAY = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'In Review',
  DONE: 'Done',
};


export const TASK_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
};


export const TASK_PRIORITY_DISPLAY = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Urgent',
};


export const PROJECT_STATUS = {
  ACTIVE: 0,
  ON_HOLD: 1,
  COMPLETED: 2,
  ARCHIVED: 3,
};


export const PROJECT_STATUS_DISPLAY = {
  0: 'Active',
  1: 'On Hold',
  2: 'Completed',
  3: 'Archived',
};


export const PROJECT_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
};


export const ERROR_MESSAGES = {
  DEFAULT: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please fix the validation errors and try again.',
  SERVER: 'Server error. Please try again later.',
};


export const COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
};


export const STATUS_COLORS = {
  TODO: '#ff9800',
  IN_PROGRESS: '#2196f3',
  REVIEW: '#9c27b0',
  DONE: '#4caf50',
};


export const PRIORITY_COLORS = {
  1: '#8bc34a',
  2: '#ffeb3b',
  3: '#ff9800',
  4: '#f44336',
};


export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 25, 50],
};


export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id) => `/projects/${id}`,
  PROJECT_CREATE: '/projects/new',
  PROJECT_EDIT: (id) => `/projects/${id}/edit`,
  TASKS: '/tasks',
  TASK_DETAIL: (id) => `/tasks/${id}`,
  TASK_CREATE: '/tasks/new',
  TASK_EDIT: (id) => `/tasks/${id}/edit`,
  PROFILE: '/profile',
};


export const DATE_FORMATS = {
  DISPLAY: 'MM/dd/yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
};
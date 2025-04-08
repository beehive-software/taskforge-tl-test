


export const isValidEmail = (email) => {
    // Simple regex for email validation - not comprehensive
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Duplicate approach to email validation - inconsistent pattern
  export function validateEmail(email) {
    if (!email) return false;
    
    // More complex regex but still not perfect
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
  
  // Password validation - duplicating backend logic
  export const validatePassword = (password) => {
    if (!password) return { valid: false, message: 'Password is required' };
    
    // Check length
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    return { valid: true, message: '' };
  };
  
  // Form field validation - generic
  export const validateField = (fieldName, value, formData = {}) => {
    switch (fieldName) {
      case 'email':
        if (!value) return 'Email is required';
        if (!isValidEmail(value)) return 'Invalid email format';
        return '';
      
      case 'password':
        const result = validatePassword(value);
        return result.valid ? '' : result.message;
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      case 'firstName':
      case 'lastName':
        if (!value) return `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`;
        if (value.length < 2) return `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        return '';
      
      case 'projectName':
        if (!value) return 'Project name is required';
        if (value.length < 3) return 'Project name must be at least 3 characters';
        if (value.length > 100) return 'Project name must be less than 100 characters';
        return '';
      
      case 'taskTitle':
        if (!value) return 'Task title is required';
        if (value.length < 3) return 'Task title must be at least 3 characters';
        if (value.length > 255) return 'Task title must be less than 255 characters';
        return '';
      
      case 'dueDate':
        if (!value) return '';  // Due date is optional
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        
        // Check if due date is in the past - this should be a warning, not an error
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return 'Due date is in the past';
        
        return '';
      
      default:
        return '';
    }
  };
  
  // Task status validation - duplicating backend constants
  export const isValidTaskStatus = (status) => {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    return validStatuses.includes(status);
  };
  
  // Project status validation - completely different approach than task status
  export const isValidProjectStatus = (status) => {
    // Using numeric codes instead of strings like for tasks
    return [0, 1, 2, 3].includes(Number(status));
  };
  
  // Task priority validation - duplicating backend logic
  export const isValidPriority = (priority) => {
    return [1, 2, 3, 4].includes(Number(priority));
  };
  
  // Form validation - generic
  export const validateForm = (formData, formType) => {
    const errors = {};
    
    switch (formType) {
      case 'login':
        if (!formData.email) errors.email = 'Email is required';
        else if (!isValidEmail(formData.email)) errors.email = 'Invalid email format';
        
        if (!formData.password) errors.password = 'Password is required';
        break;
      
      case 'register':
        if (!formData.email) errors.email = 'Email is required';
        else if (!isValidEmail(formData.email)) errors.email = 'Invalid email format';
        
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) errors.password = passwordValidation.message;
        
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.firstName) errors.firstName = 'First name is required';
        if (!formData.lastName) errors.lastName = 'Last name is required';
        break;
      
      case 'project':
        if (!formData.name) errors.name = 'Project name is required';
        else if (formData.name.length < 3) errors.name = 'Project name must be at least 3 characters';
        else if (formData.name.length > 100) errors.name = 'Project name must be less than 100 characters';
        break;
      
      case 'task':
        if (!formData.title) errors.title = 'Task title is required';
        else if (formData.title.length < 3) errors.title = 'Task title must be at least 3 characters';
        else if (formData.title.length > 255) errors.title = 'Task title must be less than 255 characters';
        
        if (!formData.project) errors.project = 'Project is required';
        
        if (formData.status && !isValidTaskStatus(formData.status)) {
          errors.status = 'Invalid status';
        }
        
        if (formData.priority && !isValidPriority(formData.priority)) {
          errors.priority = 'Priority must be between 1 and 4';
        }
        
        if (formData.due_date) {
          const date = new Date(formData.due_date);
          if (isNaN(date.getTime())) errors.due_date = 'Invalid date format';
        }
        break;
      
      default:
        break;
    }
    
    return errors;
  };
  
  // Commented out utility function
  /*
  export const validateProjectMembers = (members) => {
    if (!Array.isArray(members)) return 'Members must be an array';
    
    for (const member of members) {
      if (!member.user_id) return 'Each member must have a user_id';
      if (!member.role) return 'Each member must have a role';
      if (!['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(member.role)) {
        return 'Invalid role';
      }
    }
    
    return '';
  };
  */
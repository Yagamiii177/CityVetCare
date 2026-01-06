/**
 * Validation Utility Functions
 * Helper functions for form validation
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Philippine mobile number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export const isValidPhoneNumber = (phone) => {
  // Philippine mobile format: 09XX-XXX-XXXX or +639XX-XXX-XXXX
  const phoneRegex = /^(09|\+639)\d{9}$/;
  const cleanPhone = phone.replace(/[-\s]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length required
 * @returns {boolean} True if value meets minimum length
 */
export const hasMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length allowed
 * @returns {boolean} True if value is within maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if value is within range
 */
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Sanitize input string
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .toString()
    .trim()
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

/**
 * Validate form data
 * @param {object} data - Form data object
 * @param {object} rules - Validation rules object
 * @returns {object} Validation result with errors
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = `${field} is required`;
    } else if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Invalid email format';
    } else if (fieldRules.phone && !isValidPhoneNumber(value)) {
      errors[field] = 'Invalid phone number format';
    } else if (fieldRules.minLength && !hasMinLength(value, fieldRules.minLength)) {
      errors[field] = `Minimum ${fieldRules.minLength} characters required`;
    } else if (fieldRules.maxLength && !hasMaxLength(value, fieldRules.maxLength)) {
      errors[field] = `Maximum ${fieldRules.maxLength} characters allowed`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

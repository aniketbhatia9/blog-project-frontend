// import { useState, useCallback } from 'react';

// export const useFormValidation = (initialValues, validationRules) => {
//   const [values, setValues] = useState(initialValues);
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   const validate = useCallback((fieldName, value) => {
//     if (validationRules[fieldName]) {
//       const rule = validationRules[fieldName];
      
//       if (rule.required && (!value || value.toString().trim() === '')) {
//         return rule.message || `${fieldName} is required`;
//       }
      
//       if (rule.minLength && value && value.toString().length < rule.minLength) {
//         return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
//       }
      
//       if (rule.pattern && value && !rule.pattern.test(value)) {
//         return rule.message || `${fieldName} format is invalid`;
//       }
      
//       if (rule.custom && value) {
//         return rule.custom(value);
//       }
//     }
    
//     return null;
//   }, [validationRules]);

//   const setValue = (name, value) => {
//     setValues(prev => ({ ...prev, [name]: value }));
    
//     // Validate on change if field has been touched
//     if (touched[name]) {
//       const error = validate(name, value);
//       setErrors(prev => ({ ...prev, [name]: error }));
//     }
//   };

//   const setTouched = useCallback((name) => {
//     setTouched(prev => ({ ...prev, [name]: true }));
    
//     // Validate on blur
//     const error = validate(name, values[name]);
//     setErrors(prev => ({ ...prev, [name]: error }));
//   }, [values, validate]);

//   const validateAll = () => {
//     const newErrors = {};
//     let isValid = true;
    
//     Object.keys(validationRules).forEach(fieldName => {
//       const error = validate(fieldName, values[fieldName]);
//       if (error) {
//         newErrors[fieldName] = error;
//         isValid = false;
//       }
//     });
    
//     setErrors(newErrors);
//     return isValid;
//   };

//   const reset = () => {
//     setValues(initialValues);
//     setErrors({});
//     setTouched({});
//   };

//   return {
//     values,
//     errors,
//     touched,
//     setValue,
//     setTouched,
//     validateAll,
//     reset,
//     isValid: Object.keys(errors).length === 0
//   };
// };
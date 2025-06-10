import React from 'react';

/**
 * Accessible form field component with proper labeling and ARIA attributes
 */
const FormField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  inputClassName = '',
  children,
  ...props
}) => {
  const fieldId = id || `field-${name}`;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [helpId, errorId].filter(Boolean).join(' ');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children || (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 ${
            error ? 'border-red-300 focus:ring-red-500' : ''
          } ${inputClassName}`}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
      )}
      
      {helpText && (
        <p id={helpId} className="text-xs text-gray-500 mt-1">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Select field component with accessibility
 */
export const SelectField = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helpText,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  const fieldId = id || `select-${name}`;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [helpId, errorId].filter(Boolean).join(' ');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 ${
          error ? 'border-red-300 focus:ring-red-500' : ''
        }`}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helpText && (
        <p id={helpId} className="text-xs text-gray-500 mt-1">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Textarea field component with accessibility
 */
export const TextareaField = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  rows = 3,
  className = '',
  ...props
}) => {
  const fieldId = id || `textarea-${name}`;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [helpId, errorId].filter(Boolean).join(' ');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 resize-vertical ${
          error ? 'border-red-300 focus:ring-red-500' : ''
        }`}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      
      {helpText && (
        <p id={helpId} className="text-xs text-gray-500 mt-1">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Checkbox field component with accessibility
 */
export const CheckboxField = ({
  id,
  name,
  label,
  checked,
  onChange,
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  ...props
}) => {
  const fieldId = id || `checkbox-${name}`;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [helpId, errorId].filter(Boolean).join(' ');

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-start">
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {label && (
          <label 
            htmlFor={fieldId} 
            className="ml-2 block text-sm text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
      
      {helpText && (
        <p id={helpId} className="text-xs text-gray-500 mt-1 ml-6">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-1 ml-6" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;

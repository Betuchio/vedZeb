import { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm text-sm
          focus:ring-2 focus:ring-offset-0 focus:outline-none
          ${error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          }
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        `}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

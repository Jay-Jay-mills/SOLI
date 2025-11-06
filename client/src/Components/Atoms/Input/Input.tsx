'use client';

import React from 'react';
import { Input as AntInput, InputProps } from 'antd';
import clsx from 'clsx';

interface CustomInputProps extends InputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  const inputClasses = clsx(
    error && 'border-error',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          {label}
          {props.required && <span className="ml-1 text-error">*</span>}
        </label>
      )}
      <AntInput className={inputClasses} {...props} />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
    </div>
  );
};

export default Input;

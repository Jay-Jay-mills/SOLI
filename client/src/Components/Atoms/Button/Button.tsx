'use client';

import React from 'react';
import { Button as AntButton, ButtonProps } from 'antd';
import clsx from 'clsx';

interface CustomButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  fullWidth?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}) => {
  const buttonClasses = clsx(
    fullWidth && 'w-full',
    className
  );

  const variantType = {
    primary: 'primary',
    secondary: 'default',
    danger: 'primary',
    ghost: 'ghost',
    link: 'link',
  }[variant] as ButtonProps['type'];

  return (
    <AntButton
      type={variantType}
      danger={variant === 'danger'}
      className={buttonClasses}
      {...props}
    />
  );
};

export default Button;

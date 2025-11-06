'use client';

import React from 'react';
import { Card as AntCard, CardProps } from 'antd';
import clsx from 'clsx';

interface CustomCardProps extends CardProps {
  hoverable?: boolean;
}

export const Card: React.FC<CustomCardProps> = ({
  hoverable = false,
  className,
  ...props
}) => {
  const cardClasses = clsx(
    'rounded-lg shadow-soft',
    hoverable && 'transition-shadow hover:shadow-medium',
    className
  );

  return <AntCard className={cardClasses} hoverable={hoverable} {...props} />;
};

export default Card;

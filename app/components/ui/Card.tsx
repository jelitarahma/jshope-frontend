// app/components/ui/Card.tsx
'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
  onClick,
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  const hoverStyles = hover
    ? 'hover:-translate-y-1 hover:shadow-xl hover:border-amber-200 cursor-pointer'
    : '';

  return (
    <div
      className={`
        bg-white rounded-2xl border border-stone-100
        shadow-sm transition-all duration-300
        ${paddingStyles[padding]}
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Card Header Component
export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-stone-100 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

// Card Body Component
export function CardBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Card Footer Component
export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-stone-100 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'green';
}

export function Card({ children, className = '', variant = 'default', ...props }: CardProps) {
  const borderColors = {
    default: 'border-card-border hover:border-sifa-gold-500/30 dark:hover:border-sifa-green-500/30',
    gold: 'border-sifa-gold-500/30 shadow-md shadow-sifa-gold-500/5 dark:bg-sifa-gold-50/20',
    green: 'border-sifa-green-600/30 shadow-md shadow-sifa-green-900/5 dark:bg-sifa-green-50/20',
  };

  return (
    <div
      className={`rounded-2xl border bg-card-bg p-5 md:p-6 transition-all duration-300 ${borderColors[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

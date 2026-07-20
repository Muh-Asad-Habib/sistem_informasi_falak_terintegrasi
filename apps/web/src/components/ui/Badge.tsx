import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'gold' | 'blue';
}

export function Badge({ children, className = '', variant = 'default', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border';

  const variants = {
    default: 'bg-foreground/5 text-foreground/80 border-card-border',
    green: 'bg-sifa-green-50 text-sifa-green-900 border-sifa-green-100 dark:bg-sifa-green-900/20 dark:text-sifa-green-100 dark:border-sifa-green-900/30',
    gold: 'bg-sifa-gold-50 text-sifa-gold-900 border-sifa-gold-100 dark:bg-sifa-gold-900/20 dark:text-sifa-gold-100 dark:border-sifa-gold-900/30',
    blue: 'bg-sifa-blue-100/50 text-sifa-blue-900 border-sifa-blue-100 dark:bg-sifa-blue-900/20 dark:text-sifa-blue-100 dark:border-sifa-blue-900/30',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants = {
    primary: 'bg-sifa-green-900 text-white hover:bg-sifa-green-800 dark:bg-sifa-green-700 dark:hover:bg-sifa-green-600 shadow-md shadow-sifa-green-900/10 hover:shadow-lg hover:shadow-sifa-green-900/15',
    secondary: 'bg-sifa-gold-500 text-sifa-foreground hover:bg-sifa-gold-600 dark:bg-sifa-gold-600 dark:hover:bg-sifa-gold-500 shadow-md shadow-sifa-gold-500/10',
    outline: 'border border-card-border bg-transparent text-foreground hover:bg-sifa-green-50 hover:text-sifa-green-900 dark:hover:bg-sifa-green-900/20 dark:hover:text-white',
    ghost: 'text-foreground hover:bg-sifa-green-50 hover:text-sifa-green-900 dark:hover:bg-sifa-green-900/20 dark:hover:text-white',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

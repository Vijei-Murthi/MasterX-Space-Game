import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-150 rounded cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-4 py-2',
    md: 'text-xs sm:text-sm px-6 sm:px-7 py-2.5 sm:py-3',
    lg: 'text-sm sm:text-base px-8 py-3.5',
  };

  const variantStyles = {
    // Professional solid sky-blue (NASA/Aerospace inspired, non-neon)
    primary: 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 border border-slate-700',
    outline: 'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-200 border border-slate-600',
    ghost: 'bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

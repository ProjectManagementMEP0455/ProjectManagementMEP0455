import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', icon, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform';

  const sizeStyles = {
    sm: 'h-9 px-3',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-primary-foreground hover:from-brand-gradient-end hover:to-brand-gradient-start shadow-lg shadow-primary/30 hover:scale-[1.03]',
    secondary: 'bg-transparent border border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.03]',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-emerald-500/30 hover:scale-[1.03]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 h-5 w-5">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ className = '', children, ...props }) => {
  const baseStyles = 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-input/70 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

  return (
    <select className={`${baseStyles} ${className}`} {...props}>
      {children}
    </select>
  );
};

export default Select;

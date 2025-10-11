import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-card/50 backdrop-blur-xl border border-border rounded-lg shadow-sm transition-all duration-300 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
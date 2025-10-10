import React from 'react';

// FIX: Update CardProps to extend React.HTMLAttributes<HTMLDivElement> and pass down extra props.
// This allows passing attributes like 'onClick' to the Card component,
// resolving the type error in ProjectList.tsx.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;

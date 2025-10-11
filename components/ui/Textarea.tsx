import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  const baseStyles = 'flex min-h-[80px] w-full rounded-md border border-input bg-input/70 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

  return (
    <textarea className={`${baseStyles} ${className}`} {...props} />
  );
};

export default Textarea;
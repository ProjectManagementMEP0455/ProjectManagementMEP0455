
import React from 'react';
import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <img
      className={`rounded-full object-cover ${sizeClasses[size]}`}
      src={user.avatarUrl}
      alt={user.name}
      title={user.name}
    />
  );
};

export default Avatar;

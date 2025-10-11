import React from 'react';
import { Profile } from '../../types';

interface AvatarProps {
  profile: Profile;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ profile, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const placeholder = (
    <div className={`rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold ${sizeClasses[size]}`}>
      {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
    </div>
  );

  if (!profile.avatar_url) {
    return placeholder;
  }

  return (
    <img
      className={`rounded-full object-cover ${sizeClasses[size]}`}
      src={profile.avatar_url}
      alt={profile.full_name || 'User Avatar'}
      title={profile.full_name || 'User'}
    />
  );
};

export default Avatar;
import React from 'react';

interface BouncingDotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const BouncingDotsLoader: React.FC<BouncingDotsLoaderProps> = ({ 
  size = 'md', 
  color = 'text-white' 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex space-x-1">
      <div 
        className={`${sizeClasses[size]} ${color} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
      ></div>
      <div 
        className={`${sizeClasses[size]} ${color} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '150ms' }}
      ></div>
      <div 
        className={`${sizeClasses[size]} ${color} bg-current rounded-full animate-bounce`}
        style={{ animationDelay: '300ms' }}
      ></div>
    </div>
  );
};

export default BouncingDotsLoader; 
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Main logo circle with gradient */}
      <div className="absolute inset-0 rounded-full gradient-primary shadow-glow-primary animate-glow" />
      
      {/* Inner glass effect */}
      <div className="absolute inset-1 rounded-full liquid-glass" />
      
      {/* Play icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 24 24" 
          className="w-1/2 h-1/2 text-white fill-current"
        >
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>
  );
};

export const LogoText = ({ className = '', variant = 'full' }: { 
  className?: string; 
  variant?: 'full' | 'short' 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size="md" />
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {variant === 'full' ? 'VidSwipe' : 'VS'}
        </span>
        {variant === 'full' && (
          <span className="text-xs text-muted-foreground -mt-1">
            AI Discovery
          </span>
        )}
      </div>
    </div>
  );
};
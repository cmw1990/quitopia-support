import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  return (
    <header className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground text-lg">{subtitle}</p>
      )}
    </header>
  );
}; 
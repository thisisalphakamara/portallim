import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-200', // Updated default for cleaner look
    success: 'bg-green-500 text-white border-green-500',
    warning: 'bg-amber-400 text-black border-amber-400',
    danger: 'bg-red-500 text-white border-red-500'
  };

  return (
    <span className={`px-2 py-1 text-[10px] font-bold uppercase border rounded ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

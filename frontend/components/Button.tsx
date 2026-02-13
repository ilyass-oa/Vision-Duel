import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Retro styling: black border, hard shadow, translation on click
  const baseStyles = "px-6 py-3 rounded-lg font-bold text-lg transition-all duration-100 border-2 border-black shadow-retro active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px] uppercase tracking-wide";
  
  const variants = {
    primary: "bg-brand-dark text-white hover:bg-gray-800",
    secondary: "bg-white text-brand-dark hover:bg-gray-50",
    outline: "bg-transparent text-brand-dark hover:bg-brand-dark hover:text-white",
    ghost: "bg-transparent text-gray-500 hover:text-brand-dark border-transparent shadow-none active:translate-x-0 active:translate-y-0 hover:bg-gray-100",
  };

  const finalVariant = variant === 'ghost' ? variants.ghost : variants[variant];
  // Remove border/shadow for ghost if needed, but keeping retro feel for others

  return (
    <button 
      className={`${baseStyles} ${finalVariant} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
import React from 'react';

export type BadgeVariant = 'gold' | 'green' | 'dark' | 'outline' | 'gray' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  className = '',
  icon,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    gold: 'bg-[#D6A84F]/15 text-[#8C6415] border border-[#D6A84F]/40 font-semibold',
    green: 'bg-[#238B6E]/10 text-[#0B5D4B] border border-[#238B6E]/30 font-medium',
    dark: 'bg-[#064638] text-white font-medium',
    outline: 'border border-[#66736E]/30 text-[#17211E] font-medium bg-white',
    gray: 'bg-gray-100 text-[#66736E] border border-gray-200 font-medium',
    error: 'bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/30 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs transition-colors ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="w-3 h-3 flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
};

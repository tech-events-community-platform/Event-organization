import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'light' | 'outline' | 'gray' | 'error' | 'success';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  icon,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    primary: 'bg-[#63474D]/15 text-[#63474D] border border-[#63474D]/30 font-semibold',
    secondary: 'bg-[#AA767C]/15 text-[#AA767C] border border-[#AA767C]/30 font-semibold',
    tertiary: 'bg-[#D6A184]/20 text-[#7D4930] border border-[#D6A184]/40 font-semibold',
    accent: 'bg-[#FFA686]/25 text-[#913F21] border border-[#FFA686]/50 font-bold',
    light: 'bg-[#FEC196]/30 text-[#8C461F] border border-[#FEC196]/60 font-semibold',
    outline: 'border border-[#E8DDD7] text-[#2D1F23] font-medium bg-white',
    gray: 'bg-[#F4EFEB] text-[#756366] border border-[#E8DDD7] font-medium',
    success: 'bg-[#2A7B5F]/15 text-[#2A7B5F] border border-[#2A7B5F]/30 font-semibold',
    error: 'bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/30 font-medium',
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

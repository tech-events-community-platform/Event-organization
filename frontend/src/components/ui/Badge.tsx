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
    primary: 'bg-[#153E2A]/10 text-[#153E2A] border border-[#153E2A]/25 font-semibold shadow-2xs',
    secondary: 'bg-[#8BA448]/15 text-[#546820] border border-[#8BA448]/35 font-semibold shadow-2xs',
    tertiary: 'bg-[#153E2A]/15 text-[#153E2A] border border-[#153E2A]/30 font-semibold shadow-2xs',
    accent: 'bg-[#F9FF46] text-[#153E2A] border border-[#153E2A]/30 font-bold shadow-2xs',
    light: 'bg-[#8BA448]/20 text-[#153E2A] border border-[#8BA448]/40 font-semibold shadow-2xs',
    outline: 'border border-[#153E2A]/20 text-[#153E2A] font-medium bg-white/80 backdrop-blur-xs shadow-2xs',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200 font-medium shadow-2xs',
    success: 'bg-[#153E2A]/15 text-[#153E2A] border border-[#153E2A]/35 font-bold shadow-2xs',
    error: 'bg-[#B91C1C]/10 text-[#991B1B] border border-[#B91C1C]/30 font-medium shadow-2xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs transition-all duration-200 ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="w-3 h-3 flex items-center justify-center shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

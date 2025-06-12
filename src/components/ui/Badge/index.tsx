import type { FC } from 'react';

// Type definations
import type { BadgeProps } from './index.d';

const Badge: FC<BadgeProps> = ({
  children,
  size = 'medium',
  variant = 'light'
}) => {
  const getBadgeSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 'h-[28px] px-[10px] text-[12px] md:text-[16px] rounded-[8px]';
      case 'medium':
        return 'h-[32px] px-3 text-[16px] md:text-[20px] rounded-[8px]';
      case 'large':
        return 'h-[40px] px-4 text-[20px] md:text-[24px] rounded-[8px]';
      default:
        return 'h-[32px] px-3 text-[16px] md:text-[20px] rounded-[8px]';
    }
  };

  const getBadgeVariant = (variant: 'light' | 'dark') => {
    switch (variant) {
      case 'light':
        return 'bg-[#f1f0ea] text-black';
      case 'dark':
        return 'bg-[#3D3D3D] text-white';
      default:
        return 'bg-[#f1f0ea] text-black';
    }
  };
    
  return (
    <div className={`flex justify-center items-center gap-2 ${getBadgeSize(size)} ${getBadgeVariant(variant)}`}>
      {children}
    </div>
  )
}

export default Badge;
import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className = '',
  indicatorClassName = ''
}) => {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className={`h-full w-full flex-1 bg-blue-500 transition-all ${indicatorClassName}`}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  );
}; 
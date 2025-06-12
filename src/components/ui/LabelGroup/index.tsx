import type { FC } from 'react';

const LabelGroup:FC<{
    className?: string;
    label: string;
    list: string[]
}> = ({
    className,
    label,
    list
}) => {
  return (
    <div className={`flex flex-col gap-2 md:gap-3 ${className}`}>
        <label className='text-[16px] md:text-[20px] text-[#F68D00] uppercase tracking-[2px]'>{label}</label>
        
        {list.length > 0 ? (
            <div className='flex flex-col gap-2 md:gap-3'>
                {list.map((l, index) => (
                    <p className='text-[16px] md:text-[20px] 2xl:text-[22px]' key={index}>{l}</p>
                ))}
            </div>
        ) : (
            <p className='text-[204px] text-black'>No items passed.</p>
        )}
    </div>
  )
};

export default LabelGroup;
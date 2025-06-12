import { type FC } from 'react';
// import Image from 'next/image';

// Type definations
import type { ServiceInfoProps } from './index.d';

// Fonts
import { MediaSans } from '@/utils/fonts';

const ServiceInfo:FC<ServiceInfoProps> = ({
  headline,
  title,
  description,
  // image,
  reverse = false
}) => {
  return (
    <div className={`flex justify-between items-center flex-col ${reverse ? "xl:flex-row-reverse" : "xl:flex-row"} gap-6 2xl:gap-0`}>
      <div className='flex-1 max-w-[530px] flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <p className='text-[16px] md:text-[20px] text-[#F68D00] tracking-[1px] md:tracking-[32%]'>{headline}</p>
          <h2 className={`${MediaSans.className} text-[46px] md:text-[56px] xl:text-[64px] 2xl:text-[72px] leading-[100%] text-[#1B1B1B]`}>{title}</h2>
        </div>

        <p className='text-[16px] md:text-[20px] leading-[140%] text-black'>{description}</p>
      </div>

      <div className='aspect-video w-full md:w-[530px] rounded-[16px] bg-[#F1F1F1]' />
    </div>
  )
}

export default ServiceInfo;
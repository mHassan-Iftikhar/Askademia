import { type FC } from 'react';

// Type definitions
import type { CardProps } from './index.d';

// Layout
import { MediaSans } from '@/utils/fonts';

const Card: FC<CardProps> = ({
    id,
    title,
    description,
    image,
    footer
}) => {
    return (
        <a href={`/case-studies/${id}`} className='group outline-0 border-0 relative bg-[#272727] w-full h-[600px] rounded-[28px] flex justify-start items-end p-[36px] 2xl:p-[42px] overflow-hidden'>
            <img
                src={image}
                alt={`Card - ${title}`}
                className='w-full h-full object-cover'
            />

            <div className='absolute bottom-0 left-0 w-full h-full bg-[linear-gradient(355deg,black,rgba(0,0,0,0.6),transparent)] opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out' />

            <div className='relative z-10 flex flex-col gap-[16px] opacity-0 group-hover:opacity-100 translate-y-[50%] group-hover:translate-y-0 transition duration-300 ease-in-out'>
                <h3 className={`${MediaSans.className} text-[38px] md:text-[40px] 2xl:text-[44px] tracking-[1px] text-white leading-[100%]`}>
                    {title}
                </h3>

                <p className='text-[16px] md:text-[20px] text-white leading-[140%]'>
                    {description}
                </p>

                {footer && footer}
            </div>
        </a>
    );
};

export default Card;
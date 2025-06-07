import { type FC } from 'react';

// Type definations
import type { BannerProps } from './index.d';

// Components
import { MediaSans } from '@/utils/fonts';
import Container from '../../layout/Container';
import Button from '../../ui/Button';

const Banner: FC<BannerProps> = ({
    className = "",
    image,
    headline,
    title,
    description,
    descriptionClassName,
    buttons,
    ...rest
}) => {
    return (
        <section className={`relative py-[140px] ${className}`} {...rest}>
            <Container>
                <img
                    src={image}
                    alt={`Banner Image | ${title}`}
                    className='z-20 object-cover absolute top-0 left-0 w-full h-full'
                />

                <div
                    className='bg-gradient-to-r from-[rgba(0,0,0)] via-[rgba(0,0,0,0.8)] to-[rgba(0,0,0,0.5)] bg-[length:100%_100%] bg-no-repeat absolute top-0 left-0 w-full h-full z-30'
                />
                
                <div>
                    <div className='z-40 relative max-w-[600px] mr-auto flex flex-col gap-4'>
                        <div className='flex flex-col gap-2'>
                            {headline && (
                                <p className='text-[16px] md:text-[20px] text-[#F68D00] tracking-[5px] uppercase'>{headline}</p>
                            )}
                            <h2 className={`${MediaSans.className} capitalize tracking-[2px] text-[48px] md:text-[56px] xl:text-[64px] 2xl:text-[72px] leading-[100%] text-white`}>{title}</h2>
                        </div>

                        {description && (
                            <p className={`text-[16px] md:text-[20px] text-white leading-[140%] ${descriptionClassName}`}>{description}</p>
                        )}

                        {buttons && (
                            <div className='flex flex-col md:flex-row justify-start items-start gap-2 w-full md:w-auto md:gap-3'>
                                {buttons?.length > 0 && buttons.map((btn) => (
                                    <Button
                                        key={btn.type}
                                        style={btn.style}
                                        type={btn.type}
                                        className={`${btn.className} w-full md:w-fit`}
                                        onClick={btn.onClick || (() => {})}
                                    >
                                        {btn.children}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default Banner
import { type FC } from 'react';

// Components
import Container from '../Container';
import Button from '../../ui/Button';

// Type definations
import type { PageHeaderProps } from './index.d';

// Fonts
import { MediaSans } from '@/utils/fonts';

const PageHeader: FC<PageHeaderProps> = ({
  className = "",
  headline,
  title,
  description,
  button
}) => {
  return (
    <section
      className={className}
    >
      <Container>
        <div className='flex flex-col justify-center items-center gap-6'>
          <div className='flex flex-col justify-center items-center gap-2'>
            <p className='max-w-[480px] lg:max-w-[100%] text-center mx-auto uppercase text-[14px] md:text-[16px] xl:text-xl text-[#F68D00] tracking-[5px] leading-[140%]'>
              {headline}
            </p>
            <h3 className={`${MediaSans.className} max-w-[1000px] 2xl:max-w-[1415px] mx-auto text-[48px] md:text-[72px] lg:text-[62px] xl:text-[72px] 2xl:text-[96px] text-center leading-[100%] text-black`}>
              {title}
            </h3>
            {description && (
              <p className='max-w-[840px] w-full mx-auto text-center text-[16px] md:text-[24px] leading-[140%] text-black'>{description}</p>
            )}
          </div>

          {button && (
            <Button
              className='w-fit'
              style='outline'
              {...button}
            >
              {button.children}
            </Button>
          )}
        </div>
      </Container>
    </section>
  )
}

export default PageHeader;
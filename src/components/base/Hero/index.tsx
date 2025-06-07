import { type FC } from 'react';
import { Container } from '@/components';
import { MediaSans } from '@/utils/fonts';

const Hero: FC = () => {
    return (
        <section className="bg-[#1B1B1B] py-[96px] md:py-[120px]">
            <Container>
                <div className="flex flex-col gap-[48px] md:gap-[64px] max-w-[1200px] mx-auto">
                    <div className="flex flex-col gap-[24px] md:gap-[32px]">
                        <h1 className={`${MediaSans.className} text-[48px] md:text-[64px] xl:text-[72px] leading-[100%] text-white text-center`}>
                            Your AI Study Partner Learning Assistant
                        </h1>
                        <p className="text-[20px] md:text-[24px] text-white/80 text-center max-w-[800px] mx-auto">
                            Experience personalized learning with our AI-powered study companion. Get instant answers, detailed explanations, and interactive learning support.
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <p className={`${MediaSans.className} text-[32px] md:text-[40px] xl:text-[48px] text-white text-center max-w-[1000px] leading-[120%]`}>
                            Transform your learning journey with intelligent assistance that adapts to your needs and helps you achieve your academic goals.
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default Hero; 
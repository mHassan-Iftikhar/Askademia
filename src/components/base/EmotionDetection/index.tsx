import { type FC } from 'react';
import { Container } from '@/components';
import { MediaSans } from '@/utils/fonts';

const EmotionDetection: FC = () => {
    return (
        <section className="bg-[#1B1B1B] py-[96px] md:py-[120px]">
            <Container>
                <div className="flex flex-col gap-[48px] md:gap-[64px] max-w-[1200px] mx-auto">
                    <div className="flex flex-col gap-[24px] md:gap-[32px]">
                        <h2 className={`${MediaSans.className} text-[48px] md:text-[64px] xl:text-[72px] leading-[100%] text-white text-center`}>
                            Face & Emotion Detection
                        </h2>
                        <p className="text-[20px] md:text-[24px] text-white/80 text-center max-w-[800px] mx-auto">
                            Our advanced AI technology analyzes your facial expressions and emotions to provide personalized learning support and feedback. Experience learning that adapts to your emotions, ensuring optimal engagement and understanding through real-time facial expression analysis.
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default EmotionDetection; 
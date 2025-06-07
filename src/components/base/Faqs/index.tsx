import { type FC } from 'react';

// Components
import Accordion from '@/components/ui/Accordion';
import { Container, SectionHeader } from '@/components';

// Type definations
import type { FaqsProps } from './index.d';

// Mock data
import { faqsData } from '@/mock';

const Faqs: FC<FaqsProps> = () => {
    return (
        <section id="faqs" className="py-[96px] md:py-[120px]">
            <Container>
                <SectionHeader
                    title='Frequently Asked Questions'
                    description="Got questions? We've got answers."
                    titleClassName='text-[#1B1B1B]'
                    descriptionClassName='text-[#1B1B1B]'
                >
                    <div className='w-full mx-auto flex flex-col gap-4'>
                        {faqsData.map((faq) => (
                            <Accordion
                                key={faq.title}
                                title={faq.title}
                                content={faq.content}
                            />
                        ))}
                    </div>
                </SectionHeader>
            </Container>
        </section>
    );
};

export default Faqs;
// Components
import {Button, Container, Header, SectionHeader, Footer, Specialties, Faqs, EmotionDetection} from "@/components";

// Fonts
import { MediaSans } from '@/utils/fonts';
// Icons
import { ArrowRight, Mail, Send } from "@/utils/icons";

// Mock data
import { faqsData } from '@/mock';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    to: 'hassaniftikharco@gmail.com'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to send message');
            }

            setSuccess(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <div className="pt-[100px] md:pt-[120px]">
                    <Container>
                        <section className="flex flex-col gap-[64px] md:gap-[120px]">
                            <div className="flex flex-col gap-[32px] md:gap-[48px]">
                                <div className="flex flex-col gap-[24px] md:gap-[32px]">
                                    <p className='text-[20px] md:text-[24px] text-center md:text-left 2xl:text-[32px] text-[#1B1B1B]'>👋 Hey, I&apos;m your AI Tutor</p>
                                    <div className='flex flex-col'>
                                        <h2 className={`${MediaSans.className} text-[18vw] text-center md:text-left md:text-[11.5vw] lg:text-[11.5vw] xl:text-[150px] 2xl:text-[180px] leading-[100%]`}>Your 24/7</h2>
                                        <h2
                                            className={`${MediaSans.className} text-[18vw] text-center md:text-left md:text-[11.5vw] lg:text-[11.5vw] xl:text-[150px] 2xl:text-[180px] leading-[100%]`}
                                            style={{
                                                WebkitTextStroke: "1.5px black",
                                                color: "transparent"
                                            }}
                                        >AI Study Partner</h2>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-[24px] md:gap-[32px] justify-center md:justify-start">
                                    <Button
                                        className="w-full md:w-auto"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Start Learning Now
                                        <ArrowRight />
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const featuresSection = document.getElementById('features');
                                            if (featuresSection) {
                                                featuresSection.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        style="outline"
                                        className="w-full md:w-auto"
                                    >
                                        Learn more
                                        <ArrowRight />
                                    </Button>
                                </div>
                            </div>
                        </section>
                    </Container>
                </div>

                <div className="mt-[120px] md:mt-[160px]">
                    <Container>
                        <section className="flex flex-col gap-[64px] md:gap-[120px]">
                            <SectionHeader title='Specialties' description="What I can do for you.">
                                <Specialties />
                            </SectionHeader>
                        </section>
                    </Container>
                </div>

                <div className="mt-[120px] md:mt-[160px]">
                    <EmotionDetection />
                </div>

                <div>
                    <Container>
                        <section className="flex flex-col gap-[64px] md:gap-[120px]">
                            <Faqs data={faqsData} />
                        </section>
                    </Container>
                </div>

                {/* Contact Section */}
                <div className="mt-[60px] md:mt-[80px] bg-gray-50 py-[80px] md:py-[120px]">
                    <Container>
                        <section className="flex flex-col gap-[64px] md:gap-[120px]">
                            <div className="flex flex-col items-center text-center gap-8">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-8 h-8 text-[#FC3E6B]" />
                                    <h2 className={`${MediaSans.className} text-[48px] md:text-[64px] leading-[100%]`}>Contact Us</h2>
                                </div>
                                <p className="text-[20px] text-gray-600 max-w-[600px]">
                                    Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                                </p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit(e);
                            }} className="max-w-[600px] mx-auto w-full flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="text-[18px] font-medium">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FC3E6B] focus:outline-none"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-[18px] font-medium">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FC3E6B] focus:outline-none"
                                        placeholder="Your email"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="message" className="text-[18px] font-medium">Message</label>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        required
                                        rows={6}
                                        className="px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FC3E6B] focus:outline-none resize-none"
                                        placeholder="Your message"
                                    />
                                </div>

                                {success && (
                                    <p className="text-green-600 text-center">Message sent successfully!</p>
                                )}
                                {error && (
                                    <p className="text-red-600 text-center">{error}</p>
                                )}

                                <Button
                                    onClick={() => {
                                        const form = document.querySelector('form');
                                        if (form) form.requestSubmit();
                                    }}
                                    className="w-full md:w-auto mx-auto"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </section>
                    </Container>
                </div>
            </main>
            <Footer />
        </div>
    );
}

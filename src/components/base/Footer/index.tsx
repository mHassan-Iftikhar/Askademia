// Components
import Container from '../../layout/Container';

// Fonts
import { MediaSans } from '@/utils/fonts';

const Footer = () => {
    return (
        <footer className='bg-black h-20'>
            <Container className='h-full'>
                <div className=' flex h-full justify-between items-center'>
                    <div className='hidden md:flex justify-start items-start gap-10'>
                        {[
                            {
                                label: "Home",
                                href: "/",
                            },
                            {
                                label: "Features",
                                href: "#features",
                            },
                            {
                                label: "FAQs",
                                href: "#faqs",
                            },
                        ].map((link) => (
                            <a key={link.label} className='text-white text-[20px]' href={link.href}>{link.label}</a>
                        ))}
                    </div>

                    <div className='flex justify-start items-end gap-2'>
                        <a className={`${MediaSans.className} text-[40px] leading-[92%] text-white cursor-pointer`} target='_blank'>Get Started</a>
                        <div className='w-3 h-3 rounded-full bg-[#FC3E6B]' />
                    </div>
                </div>
            </Container>
        </footer>
    )
}

export default Footer;
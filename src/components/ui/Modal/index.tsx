import type { FC } from 'react';

// Type definations
// Type definations
import type { ModalProps } from './index.d';
import { ArrowLeft, X } from 'lucide-react';

const Modal: FC<ModalProps> = ({
    children,
    onClose = () => {}
}) => {
    return (
        <div
            onClick={onClose}
            className='z-50 fixed top-0 left-0 w-full h-full backdrop-blur-md flex justify-center items-center'
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className='relative max-w-[1440px] h-[80dvh] md:h-[90dvh] lg:h-[720px] bg-white border-2 border-solid border-[#E8E8E8] rounded-[28px] flex justify-center items-center w-[90%] 2xl:w-full'
            >
                <div className='absolute flex justify-between items-center top-[22px] md:top-[34px] left-[22px] md:left-[34px] right-[22px] md:right-[34px] w-auto h-[42px]'>
                    <button
                        onClick={() => {}}
                        className='flex md:hidden mr-auto w-[42px] h-[42px] rounded-[12px] bg-[#E8E8E8] justify-center items-center'
                    >
                        <ArrowLeft width={24} height={24} className='text-[#1B1B1B]' />
                    </button>
                    
                    <button
                        onClick={onClose}
                        className='ml-auto w-[42px] h-[42px] rounded-[12px] bg-[#E8E8E8] flex justify-center items-center'
                    >
                        <X width={24} height={24} className='text-[#1B1B1B]' />
                    </button>
                </div>

                {children}
            </div>
        </div>
    )
};

export default Modal;
import { useMemo, type FC } from 'react';

// Type definations
import type { ButtonProps } from './index.d';

const Button: FC<ButtonProps & { asChild?: boolean, afterSignInUrl?: string, afterSignUpUrl?: string }> = ({
    className = "",
    children,
    onClick = () => { },
    style = "solid",
    type = "button",
    asChild,
    afterSignInUrl,
    afterSignUpUrl,
    ...rest
}) => {
    const getButtonStyle = useMemo(() => {
        if (style === "solid") {
            return "bg-[#1B1B1B] text-[#fff]";
        } else if (style === "outline") {
            return "border border-solid border-[#1B1B1B] text-[#1B1B1B]";
        }
    }, [style]);

    return (
        <button
            className={`
                h-[56px] 2xl:h-[60px]
                flex justify-center items-center gap-3
                px-6 rounded-2xl
                text-[18px] 2xl:text-[20px]
                ${getButtonStyle}
                ${className}
            `}
            onClick={onClick}
            type={type}
            {...rest}
        >
            {children}
        </button>
    )
};

export default Button;
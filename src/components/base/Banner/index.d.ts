import { ButtonProps } from "../../ui/Button/index.d";

export interface BannerProps extends React.HTMLAttributes<HTMLElement> {
    image: string;
    headline?: string;
    title: string;
    description?: string;
    descriptionClassName?: string;
    buttons?: ButtonProps[]
}
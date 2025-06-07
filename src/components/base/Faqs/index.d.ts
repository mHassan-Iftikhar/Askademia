export interface FaqsProps extends React.HTMLAttributes<HTMLElement> {
    data: {
        title: string;
        content: string;
    }[]
};
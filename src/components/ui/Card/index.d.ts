import type { ReactNode } from "react";

export interface CardProps {
    id: string;
    title: string;
    description: string;
    image: string;
    footer?: ReactNode
}
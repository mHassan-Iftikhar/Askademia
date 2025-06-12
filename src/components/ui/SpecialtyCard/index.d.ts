import type { ReactNode } from "react";

export interface SpecialtyCardProps {
    title: string;
    description: string;
    image: string;
    footer?: ReactNode;
    imageStyles?: string;
    className?: string;
}
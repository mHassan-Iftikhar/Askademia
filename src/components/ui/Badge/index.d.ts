import React, { ReactNode } from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    size?: 'small' | 'medium' | 'large';
    variant?: 'light' | 'dark'
}
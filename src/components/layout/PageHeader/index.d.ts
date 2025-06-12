import React from "react";
import { ButtonProps } from "../../ui/Button";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
    headline: string;
    title: string;
    description?: string
    button?: ButtonProps
};
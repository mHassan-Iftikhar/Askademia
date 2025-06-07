import React from "react";

type ButtonType = "button" | "submit" | "reset";

type ButtonStyle = "solid" | "outline";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onClick?: () => void;
    type?: ButtonType;
    style?: ButtonStyle;
}
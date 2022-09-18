import React from "react";
import { PropsWithChildren } from "react";

export interface ButtonProps extends Pick<PropsWithChildren, "children"> {
    variant?: "outlined" | "contained" | "text";
    align?: "left" | "center" | "right";
    size?: "sm" | "md" | "lg";
    startIcon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    onClick?: (event: React.MouseEvent) => void;
}

export default function Button(props: ButtonProps) {
    const { 
        children, 
        startIcon, 
        variant = "contained", 
        align = "left", 
        disabled = false, 
        size = "md", 
        className, 
        onClick = () => {} 
    } = props;

    const alignClassName = 
        align === "center" ? "justify-center" : 
        align === "right" ? "justify-end" : 
        "justify-start";

    const variantClassNames = 
        variant === "contained" ? `bg-body-light ${!disabled ? 'hover:bg-body-lighter' : ''}` :
        variant === "outlined" ? `bg-body-lighter bg-opacity-10 border-2 border-body-lighter hover:bg-opacity-30 active:bg-opacity-50` :
        `bg-body-lighter bg-opacity-0 hover:bg-opacity-30 active:bg-opacity-60`;

    const sizeClassNames = 
        size === "sm" ? `py-1.5 px-2` : 
        size === "lg" ? `py-3 px-8` : 
        `py-2.5 px-4`;

    const disabledClassNames = disabled ? "transform-none active:scale-100 cursor-not-allowed bg-neutral-700 opacity-30" : "";

    return (
        <button onClick={onClick} disabled={disabled} className={`inline-flex gap-2 rounded text-sm font-normal text-white items-center transform-gpu ${!disabled ? 'active:scale-95' : ''} transition-all will-change-transform ${alignClassName} ${variantClassNames} ${disabledClassNames} ${className} ${sizeClassNames}`}>
            {startIcon}
            {children}
        </button>
    );
}
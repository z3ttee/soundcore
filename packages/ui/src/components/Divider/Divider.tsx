import React from "react";

export interface DividerProps {
    variant: "solid" | "fade";
    strokeWidth?: number;
    className?: string;
}
export default function Divider(props: DividerProps) {
    const { 
        className, 
        strokeWidth = 2,
        variant = "solid" 
    } = props;

    return <hr style={{height: `${strokeWidth}px`}} className={`block w-full appearance-none rounded-full border-none ${className} ${variant === 'fade' ? 'bg-divider' : 'bg-white-light bg-opacity-25'}`} />
}
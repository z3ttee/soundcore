import React, { PropsWithChildren } from "react";

export interface HoverableProps {
    className?: string;
}
export default function Hoverable(props: PropsWithChildren<HoverableProps>) {
    const { 
        children,
        className,
    } = props;

    return (
        <div className={`bg-body-light bg-opacity-0 hover:bg-opacity-30 cursor-pointer rounded transition-all ${className}`}>
            {children}
        </div>
    );
}
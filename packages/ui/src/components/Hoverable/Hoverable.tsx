import React, { PropsWithChildren } from "react";

export interface HoverableProps extends Pick<PropsWithChildren, "children"> {
    className?: string;
}

const Hoverable = React.forwardRef<HTMLDivElement, HoverableProps>((props, ref) => {
    const { 
        children,
        className,
    } = props;

    return (
        <div ref={ref} className={`bg-body-light bg-opacity-0 hover:bg-opacity-30 cursor-pointer rounded transition-all ${className}`}>
            {children}
        </div>
    );
});

Hoverable.displayName = Hoverable.name;
export default Hoverable;
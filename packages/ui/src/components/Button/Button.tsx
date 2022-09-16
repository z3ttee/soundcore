import React from "react";
import { PropsWithChildren } from "react";

export interface ButtonProps extends Pick<PropsWithChildren, "children"> {

}

export default function Button(props: ButtonProps) {
    const { children } = props;

    return (
        <button className="bg-accent">{children}</button>
    );
}
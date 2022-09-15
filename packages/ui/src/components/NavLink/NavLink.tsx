import React from "react";
import { useRouter } from 'next/router';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

export interface NavLinkProps {
    href: string;
    exact?: boolean;
    activeClassName?: string;
    className?: string;
}

export default function NavLink(props: PropsWithChildren<NavLinkProps>) {
    const { href, exact, children, activeClassName } = props
    const { pathname } = useRouter();
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    let computedClassName = props.className || "";

    if (isActive) {
        computedClassName += ` ${activeClassName}`;
    }
    
    return (
        <Link href={href}>
            <a className={computedClassName}>{children}</a>
        </Link>
    );
}
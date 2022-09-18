import React from "react";
import { PropsWithChildren } from "react";
import NavLink, { NavLinkProps } from "../NavLink/NavLink";

export default function DrawerNavigationLink(props: PropsWithChildren<NavLinkProps>) {
    const { href, exact = false, children } = props;

    return (
        <NavLink 
            href={href} 
            exact={exact} 
            className='block w-full py-2.5 px-4 rounded-sm bg-body-light bg-opacity-0 hover:bg-opacity-30 transition-all' 
            activeClassName='text-accent'>
            {children}
        </NavLink>
    );
}
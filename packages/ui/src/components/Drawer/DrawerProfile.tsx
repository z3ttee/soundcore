import React, { PropsWithChildren, useState } from "react";
import Image from "next/image";
import { Button } from "../Button";
import { Hoverable } from "../Hoverable";
import { useFloating, useInteractions, useHover, safePolygon } from '@floating-ui/react-dom-interactions';
import DrawerLink from "./DrawerLink";

export interface DrawerProfileProps {
    username?: string;
    avatarUrl?: string;
    onSignInClicked?: () => void;
}
export default function DrawerProfile(props: PropsWithChildren<DrawerProfileProps>) {
    const { 
        children,
        username,
        avatarUrl,
        onSignInClicked = () => {},
    } = props;

    const [open, setOpen] = useState(false);

    // Create floating-ui instance
    const { reference, floating, strategy, x, y, context } = useFloating({
        strategy: "absolute",
        placement: "top",
        onOpenChange: (isOpen) => setOpen(isOpen)
    });

    // Add onHover interaction
    const { getFloatingProps } = useInteractions([
        useHover(context, {
            handleClose: safePolygon()
        })
    ]);

    const isAuthenticated = !!username;

    return (
        <div className="relative w-full">
            {/** If user is authenticated, show profile section */}
            {isAuthenticated && <>
                <Hoverable className="flex relative w-full items-center gap-2 lg:gap-4 p-2 select-none" ref={reference}>
                    {/** Avatar Image */}
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-body-light">
                        {avatarUrl && <Image alt="Avatar" src={avatarUrl} layout="fill" />}
                    </div>

                    {/** Username */}
                    <div>
                        <p className="text-xs opacity-40 font-light">Angemeldet als</p>
                        <p>{username}</p>
                    </div>            

                    {/** Menu */}
                    <div 
                        ref={floating} 
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                            opacity: open ? 1.0 : 0.0,
                            pointerEvents: open ? "auto" : "none",
                        }} 
                        className={`w-full transition-all py-2 will-change-auto transform-gpu ${open ? 'translate-y-0' : 'translate-y-2'} cursor-default`}
                        {...getFloatingProps}>
                            <div className="block w-full p-2 bg-body rounded overflow-hidden">
                                {children}
                            </div>
                    </div>      
                </Hoverable>
            </>}

            {/** If user is not authenticated, show login button */}
            {!isAuthenticated && <>
                <Button className="w-full" size="lg" align="center" onClick={onSignInClicked}>Jetzt anmelden</Button>
            </>}
        </div>
    );
}
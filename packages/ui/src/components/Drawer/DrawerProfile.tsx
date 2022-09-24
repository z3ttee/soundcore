import React, { PropsWithChildren } from "react";
import Image from "next/image";
import { Button } from "../Button";
import { Hoverable } from "../Hoverable";

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

    const isAuthenticated = !!username;

    return (
        <div className="relative w-full">
            {/** If user is authenticated, show profile section */}
            {isAuthenticated && <>
                <Hoverable className="flex relative w-full items-center gap-2 lg:gap-4 p-2 select-none">
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
                    <div className="border">
                        {children}
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
import React from "react";
import Image from "next/image";

export interface DrawerHeaderProps {
    title: string;
    logoImageUrl?: string;
    logoAltText?: string;
    logoWidthPx?: number;
    logoHeightPx?: number;
}
export default function DrawerHeader(props: DrawerHeaderProps) {
    const { 
        title,
        logoImageUrl, 
        logoAltText,
        logoWidthPx = 32,
        logoHeightPx = logoWidthPx
    } = props;

    return (
        <div className="flex w-full items-center gap-2 lg:gap-4 p-window">
            {logoImageUrl && <Image alt={logoAltText} src={logoImageUrl} width={logoWidthPx} height={logoHeightPx} />}
            <p className='text-xl font-bold'>{title}</p>
        </div>
    );
}
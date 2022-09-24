import React from 'react';
import { PropsWithChildren } from 'react';

export interface DrawerProps {
    content: React.ReactNode;
    showLoader?: boolean;
}

export default function Drawer(props: PropsWithChildren<DrawerProps>) {
    const { children, content, showLoader } = props;

    return (
        <div className="flex flex-row h-full flex-1 relative">
            {/** Drawer container */}
            <div className="absolute md:static md:w-[90px] lg:w-[280px] transform-gpu -translate-x-full md:-translate-x-0 bg-body-dark overflow-hidden">
                <div className='relative h-full w-full'>
                    {children}
                </div>
            </div>

            {/** Content container */}
            <div className="relative h-full flex-grow overflow-y-auto overflow-x-hidden">
                {content}
            </div>

            {showLoader && <div className='absolute w-full pointer-events-none select-none z-[1000000] bg-accent h-1 transition-all'>
                
            </div>}
        </div>
    );
}
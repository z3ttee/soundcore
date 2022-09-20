import React from 'react';
import { PropsWithChildren } from 'react';

export interface DrawerProps {
    content: React.ReactNode;
}

export default function Drawer(props: PropsWithChildren<DrawerProps>) {
    const { children, content } = props;

    return (
        <div className="flex flex-row h-full flex-1">
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
        </div>
    );
}
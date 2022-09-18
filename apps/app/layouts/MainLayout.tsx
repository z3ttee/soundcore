import { Drawer, DrawerLink, DrawerHeader } from "@soundcore/ui";
import { PropsWithChildren } from "react";

export default function MainLayout(props: PropsWithChildren<any>) {
    const { children } = props;

    return (
        <Drawer content={children}>
            {/** Title bar inside Drawer */}
            <DrawerHeader title="Soundcore" logoImageUrl="/images/branding/soundcore_logo.svg" logoAltText="Soundcore Logo" />

            {/** Navigation */}
            <div className='py-4'>
                <DrawerLink href="/" exact>Startseite</DrawerLink>
                <DrawerLink href="/library">Bibliothek</DrawerLink>
            </div>
        </Drawer>
    );
}
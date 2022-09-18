import { Drawer, DrawerLink, DrawerHeader } from "@soundcore/ui";
import { useSession } from "next-auth/react";
import { PropsWithChildren } from "react";

export default function MainLayout(props: PropsWithChildren<any>) {
    const { children } = props;
    const { data } = useSession();

    return (
        <Drawer content={children}>
            {/** Title bar inside Drawer */}
            <DrawerHeader title="Soundcore" logoImageUrl="/images/branding/soundcore_logo.svg" logoAltText="Soundcore Logo" />

            {/** Navigation */}
            <div className='flex flex-col gap-1 p-box'>
                <DrawerLink href="/" exact>Startseite</DrawerLink>
                <DrawerLink href="/library">Bibliothek</DrawerLink>
                <DrawerLink href={`/profile/${data?.user?.name}`}>Dein Profil</DrawerLink>
            </div>
        </Drawer>
    );
}
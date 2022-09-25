import { Divider, Drawer, DrawerHeader, DrawerLink, DrawerProfile } from "@soundcore/ui";
import { signIn } from "next-auth/react";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { LayoutProps } from "./BlankLayout";

export default function AdminPanelLayout(props: PropsWithChildren<LayoutProps>) {
    const { children, loading } = props;
    const profile = useSelector((state: AppState) => state.auth.session?.profile);
    const avatarUrl = "";

    return (
        <Drawer content={children} showLoader={loading}>
            <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
                {/** Title bar inside Drawer */}
                <DrawerHeader title="Soundcore ACP" logoImageUrl="/images/branding/soundcore_logo.svg" logoAltText="Soundcore Logo" />

                <Divider variant="fade" />

                {/** Back to app nav */}
                <div className='flex flex-col gap-1 p-box py-window'>
                    <DrawerLink href="/" exact>Zurück zur App</DrawerLink>
                </div>

                <Divider variant="fade" />

                {/** Navigation */}
                <div className="flex-grow overflow-x-hidden overflow-y-auto">
                    <div className="flex flex-col px-box py-window gap-1">
                        <DrawerLink href="/admin" exact>Dashboard</DrawerLink>
                        <DrawerLink href="/admin/zones">Speicherzonen</DrawerLink>
                        <DrawerLink href="/admin/tasks">Tasks</DrawerLink>
                    </div>
                </div>

                <Divider variant="fade" />

                {/** Profile section */}
                <div className="px-box py-window">
                    <DrawerProfile username={profile?.name} avatarUrl={avatarUrl} onSignInClicked={() => signIn()}>
                        <DrawerLink href="/" exact>Zurück zur App</DrawerLink>
                        <DrawerLink href="/settings">Einstellungen</DrawerLink>
                    </DrawerProfile>
                </div>
            </div>
        </Drawer>
    );
}
import { Drawer, DrawerHeader, DrawerLink } from "@soundcore/ui";
import { PropsWithChildren } from "react";
import { LayoutProps } from "./BlankLayout";

export default function AdminPanelLayout(props: PropsWithChildren<LayoutProps>) {
    const { children, loading } = props;

    return (
        <Drawer content={children} showLoader={loading}>
            {/** Title bar inside Drawer */}
            <DrawerHeader title="Soundcore ACP" logoImageUrl="/images/branding/soundcore_logo.svg" logoAltText="Soundcore Logo" />

            {/** Back to app nav */}
            <div className="p-box">
                <DrawerLink href="/" exact>Zurück zur App</DrawerLink>
            </div>

            {/** Navigation */}
            <div className='flex flex-col gap-1 p-box'>
                <DrawerLink href="/admin" exact>Dashboard</DrawerLink>
                <DrawerLink href="/admin/zones">Speicherzonen</DrawerLink>
                <DrawerLink href="/admin/tasks">Tasks</DrawerLink>
            </div>
        </Drawer>
    );
}
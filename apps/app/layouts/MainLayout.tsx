import { Drawer, DrawerLink, DrawerHeader, DrawerProfile, Divider } from "@soundcore/ui";
import { signIn } from "next-auth/react";
import { PropsWithChildren } from "react";
import { connect, useSelector } from "react-redux";
import { AppState } from "../store/store";
import { LayoutProps } from "./BlankLayout";

function MainLayout(props: PropsWithChildren<LayoutProps>) {
    const { children, loading } = props;

    const profile = useSelector((state: AppState) => state.auth.session?.profile);
    const avatarUrl = "";

    const profileDestinationPath = `/profile/${profile?.slug}`;
    const playlists = useSelector((state: AppState) => state.playlist.list);

    return (
        <Drawer content={children} showLoader={loading}>
            <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
                {/** Title bar inside Drawer */}
                <DrawerHeader title="Soundcore" logoImageUrl="/images/branding/soundcore_logo.svg" logoAltText="Soundcore Logo" />

                <Divider variant="fade" />

                {/** Navigation */}
                <div className='flex flex-col gap-1 p-box py-window'>
                    <DrawerLink href="/" exact>Startseite</DrawerLink>
                    <DrawerLink href="/library">Bibliothek</DrawerLink>
                    <DrawerLink href={profileDestinationPath}>Dein Profil</DrawerLink>
                </div>

                <Divider variant="fade" />

                {/** Show playlists */}
                <div className="flex-grow overflow-x-hidden overflow-y-auto">
                    <div className="flex flex-col px-box py-window gap-1">
                        {Object.values(playlists).map((playlist, index) => (
                            <DrawerLink key={`drawer-playlist-item-${index}`} href="/playlist/1" exact>{playlist.id}</DrawerLink>
                        ))}

                        <DrawerLink href="/playlist/1" exact>Playlist 1</DrawerLink>
                        <DrawerLink href="/playlist/2" exact>Playlist 2</DrawerLink>
                        <DrawerLink href="/playlist/3" exact>Playlist 3</DrawerLink>
                        <DrawerLink href="/playlist/4" exact>Playlist 4</DrawerLink>
                        <DrawerLink href="/playlist/5" exact>Playlist 5</DrawerLink>
                        <DrawerLink href="/playlist/6" exact>Playlist 6</DrawerLink>
                    </div>
                </div>

                <Divider variant="fade" />

                {/** Profile section */}
                <div className="px-box py-window">
                    <DrawerProfile username={profile?.name} avatarUrl={avatarUrl} onSignInClicked={() => signIn()}>
                        <li>Item 1</li>
                    </DrawerProfile>
                </div>
            </div>
        </Drawer>
    );
}

function mapStateToProps(state, props) {
    return {
        ...state,
        ...props
    }
}

export default connect(mapStateToProps)(MainLayout);
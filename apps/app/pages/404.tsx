import { Button } from "@soundcore/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Error404() {
    const { data } = useSession();
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden p-window">
            <div className="flex items-center gap-4">
                <h1>404</h1>
                <h5 className="opacity-70 font-semi">Not Found</h5>
            </div>

            <div className="mt-row">
                <p className="opacity-60 font-light">Leider konnten keine Ergebnisse für diese Anfrage gefunden werden.</p>
                <p className="opacity-60 font-light">Vielleicht helfen dir folgende Links:</p>

                <ul className="flex flex-col gap-2 pt-row w-48">
                    <li><Button variant="text" className="w-full" onClick={() => router.push("/")}>Zur Startseite</Button></li>
                    <li><Button variant="text" className="w-full" onClick={() => router.push("/search")}>Etwas suchen</Button></li>
                    <li><Button variant="text" className="w-full" onClick={() => router.push(`/profile/${data?.user?.name}`)}>Dein Profil</Button></li>
                </ul>
            </div>
        </div>
    );
}
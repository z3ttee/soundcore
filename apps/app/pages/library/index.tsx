import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

export interface LibraryPageProps {
}

export default function LibraryPage(props: LibraryPageProps) {

    return (
        <div className="">
            <h3>Deine Bibliothek</h3>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<LibraryPageProps> = async (ctx) => {
    const session = await getSession();

    return {
        props: {
        },
    }
}
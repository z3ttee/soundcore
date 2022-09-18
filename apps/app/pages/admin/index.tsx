import { useSession } from "next-auth/react";

export interface AdminDashboardProps {}
export default function AdminDashboard() {
    const { data } = useSession();

    return (
        <div className="px-window pt-window">
            <div className="w-full">
                <h2>Hey, {data?.user?.name}</h2>
            </div>
        </div>
    );
}
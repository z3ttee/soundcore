import { ScLogo } from "@/components/logo/Logo";
import { ScSidebar } from "@/components/sidebar/Sidebar";
import SidebarCategory from "@/components/sidebar/SidebarCategory";
import SidebarItem from "@/components/sidebar/SidebarItem";
import { Books, Gauge } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import "./globals.css";

const readexFont = Readex_Pro({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Soundcore :: Cockpit",
  description: "Management console of your Soundcore instance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${readexFont.className} antialiased`}>
        <ScSidebar
          header={
            <div className="flex items-center justify-start gap-6">
              <ScLogo />
              <div>
                <p>Cockpit</p>
                <p className="text-label text-surface-on-variant2">Management Konsole</p>
              </div>
            </div>
          }
          navigation={
            <SidebarCategory label="Allgemein">
              <SidebarItem label="Dashboard" href="/" icon={<Gauge size={22} weight="duotone" />} />
              <SidebarItem label="Bibliotheken" href="/libraries" icon={<Books size={22} weight="duotone" />} />
            </SidebarCategory>
          }>
          {children}
        </ScSidebar>
      </body>
    </html>
  );
}

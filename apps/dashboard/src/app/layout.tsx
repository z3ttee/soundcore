import type { Metadata } from "next";
import "./styles.scss";

export const metadata: Metadata = {
  title: "Soundcore :: Dashboard",
  description: "Soundcore Management Dashboard to configure your soundcore instances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

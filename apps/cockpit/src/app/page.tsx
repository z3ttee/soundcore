"use client";
import { useSidebar } from "@/components/sidebar/Sidebar";

export default function Home() {
  const sidebar = useSidebar();

  return (
    <div>
      <button onClick={() => sidebar.toggle()}>Toggle</button>
    </div>
  );
}

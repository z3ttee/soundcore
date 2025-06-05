"use client";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, ReactElement } from "react";

const sidebarItem = cva("flex items-center gap-4 border p-2 rounded outline-none transition-all", {
  variants: {
    active: {
      true: "text-surface-on border-outline bg-surface-container-low",
      false:
        "border-transparent text-surface-on-variant hover:text-surface-on hover:border-outline hover:bg-surface-container-lowest active:bg-surface-container-low",
    },
  },
});

export default function SidebarItem(props: PropsWithChildren<{ label: string; href: string; icon?: ReactElement }>) {
  const pathname = usePathname();
  return (
    <Link href={props.href} key={props.href} className={sidebarItem({ active: pathname === props.href })}>
      {props.icon}
      <p>{props.label}</p>
    </Link>
  );
}

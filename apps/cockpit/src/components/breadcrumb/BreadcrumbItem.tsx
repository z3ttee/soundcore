"use client";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

const breadcrumbItem = cva("transition-all py-1 px-2 rounded text-body-2", {
  variants: {
    active: {
      true: "text-primary",
      false: "text-surface-on-variant2 hover:bg-surface-container-lowest",
    },
  },
});

export default function BreadcrumbItem(props: PropsWithChildren<{ href: string }>) {
  const pathname = usePathname();

  return (
    <>
      <Link className={breadcrumbItem({ active: pathname === props.href })} href={props.href}>
        {props.children}
      </Link>
      <span className="last-of-type:hidden text-surface-on-variant2 select-none pointer-events-none">/</span>
    </>
  );
}

import { PropsWithChildren } from "react";

export default function SidebarCategory(props: PropsWithChildren<{ label: string }>) {
  return (
    <div className="w-full">
      <p className="mb-2 uppercase text-label text-surface-on-variant2">{props.label}</p>
      <div className="flex flex-col gap-1">{props.children}</div>
    </div>
  );
}

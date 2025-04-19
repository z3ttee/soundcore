import { PropsWithChildren } from "react";

export default function BreadcrumbGroup(props: PropsWithChildren<{}>) {
  return <div className="flex items-center gap-2">{props.children}</div>;
}

import BreadcrumbGroup from "@/components/breadcrumb/BreadcrumbGroup";
import BreadcrumbItem from "@/components/breadcrumb/BreadcrumbItem";
import { Suspense } from "react";
import LibrariesTable from "./components/LibrariesTable";

export default async function LibrariesPage() {
  return (
    <div>
      <BreadcrumbGroup>
        <BreadcrumbItem href="/libraries">Bibliotheken</BreadcrumbItem>
        <BreadcrumbItem href="/libraries/audio">Audio</BreadcrumbItem>
      </BreadcrumbGroup>

      <div className="py-4">
        <h2>Bibliotheken</h2>
        <p className="text-surface-on-variant">
          Hier können Bibliotheken verwaltet werden, um Audio-Dateien in Soundcore bereitzustellen
        </p>
      </div>

      <Suspense fallback={<div className="py-4">Loading...</div>}>
        <LibrariesTable />
      </Suspense>
    </div>
  );
}

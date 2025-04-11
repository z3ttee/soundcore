import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./views/zone-list/zone-list.component").then((m) => m.ZoneListViewComponent),
    }
]
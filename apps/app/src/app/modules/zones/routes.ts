import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./views/zones-list/zones-list.component").then(m => m.ZonesListViewComponent),
    },
    {
        path: ":zoneId",
        loadComponent: () => import("./views/zone-info/zone-info.component").then(m => m.ZoneInfoViewComponent),
    },
    {
        path: ":zoneId/:mountId",
        canActivate: [],
        loadChildren: () => import("../mounts/mounts.module").then((m) => m.MountsModule)
    },

]
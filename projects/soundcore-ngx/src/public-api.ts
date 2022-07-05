/*
 * Public API Surface of soundcore-ngx
 */

// Screen
export * from "./lib/services/screen/screen.module";
export * from "./lib/services/screen/screen.service";
export * from "./lib/services/screen/entities/screen.entity";

// Drawer
export * from "./lib/components/drawer/drawer.module";
export * from "./lib/components/drawer/drawer.component";

// Button
export * from "./lib/components/buttons/btn/btn.module";
export * from "./lib/components/buttons/btn/btn-base/btn.component";
export * from "./lib/components/buttons/btn/btn-outlined/btn.component";
export * from "./lib/components/buttons/btn/btn-text/btn.component";

export * from "./lib/components/buttons/loading-btn/loading-btn.module";
// export * from "./lib/components/buttons/loading-btn/loading-btn.component";

// Dialog
export * from "./lib/dialog/dialog.module";
export * from "./lib/dialog/services/dialog.service";
export * from "./lib/dialog/entities/dialog-ref.entity";
export * from "./lib/dialog/entities/dialog-config.entity";
export * from "./lib/dialog/components/backdrop/backdrop.component";
export * from "./lib/dialog/components/dialog-section/dialog-section.component";


// Infinitelist
export * from "./lib/components/list/infinite-list/infinite-list.module";
export * from "./lib/components/list/infinite-list/infinite-list.component";

// Tooltip
export * from "./lib/ui/tooltip/tooltip.module";
export * from "./lib/ui/tooltip/directive/tooltip.directive";

// Skeletons
export * from "./lib/components/skeletons/skeleton/skeleton.module";
export * from "./lib/components/skeletons/skeleton/skeleton.component";

// Navigation
export * from "./lib/components/navigation/bottom-nav/bottom-nav.module";
export * from "./lib/components/navigation/bottom-nav/bottom-nav.component";
export * from "./lib/components/navigation/bottom-nav/item-component/item-component.component";



export * from "./lib/components/toolbar/toolbar.module";
export * from "./lib/components/toolbar/toolbar.component";

export * from "./lib/components/navigation/tabbar/tabbar.module";
export * from "./lib/components/navigation/tabbar/tabbar.component";
export * from "./lib/components/navigation/tabbar/tab-item/tab-item.component";

// Service exports
export * from "./lib/services/screen/screen.module";
export * from "./lib/services/screen/screen.service";

// Grid items
export * from "./lib/components/grid/resource-grid-item/resource-grid-item.module";
export * from "./lib/components/grid/resource-grid-item/resource-grid-item.component";

export * from "./lib/components/grid/song-grid-item/song-grid-item.module";
export * from "./lib/components/grid/song-grid-item/song-grid-item.component";

export * from "./lib/components/grid/collection-grid-item/collection-grid-item.module";
export * from "./lib/components/grid/collection-grid-item/collection-grid-item.component";

export * from "./lib/components/grid/playlist-grid-item/playlist-grid-item.module";
export * from "./lib/components/grid/playlist-grid-item/playlist-grid-item.component";

export * from "./lib/components/grid/album-grid-item/album-grid-item.module";
export * from "./lib/components/grid/album-grid-item/album-grid-item.component";

export * from "./lib/components/grid/artist-grid-item/artist-grid-item.module";
export * from "./lib/components/grid/artist-grid-item/artist-grid-item.component";

// List exports
export * from "./lib/components/list/nav-list-item/nav-list-item.module";
export * from "./lib/components/list/nav-list-item/nav-list-item.component";
export * from "./lib/components/list/playlist-list-item/playlist-list-item.module";
export * from "./lib/components/list/playlist-list-item/playlist-list-item.component";

export * from "./lib/components/list/bullet-list/bullet-list.module";
export * from "./lib/components/list/bullet-list/bullet-list.component";

export * from "./lib/components/list/song-list-item/song-list-item.module";
export * from "./lib/components/list/song-list-item/song-list-item.component";

export * from "./lib/components/list/song-list/song-list.module";
export * from "./lib/components/list/song-list/song-list.component";

export * from "./lib/components/list/virtual-song-list/virtual-song-list.module";
export * from "./lib/components/list/virtual-song-list/virtual-song-list.component";

// Rows
export * from "./lib/components/ui-row/ui-row.module";
export * from "./lib/components/ui-row/ui-row.component";

// Grids
export * from "./lib/components/grids/vertical-grid/vertical-grid.module";
export * from "./lib/components/grids/vertical-grid/vertical-grid.component";

export * from "./lib/components/grids/horizontal-grid/horizontal-grid.module";
export * from "./lib/components/grids/horizontal-grid/horizontal-grid.component";

// Image exports
export * from "./lib/components/images/artwork/artwork.module";
export * from "./lib/components/images/artwork/artwork.component";

// Progress
export * from "./lib/components/progress/progressbar/progressbar.module";
export * from "./lib/components/progress/progressbar/progressbar.component";

// Badges
export * from "./lib/components/badges/explicit-badge/explicit-badge.module";
export * from "./lib/components/badges/explicit-badge/explicit-badge.component";

// Pipes
export * from "./lib/pipes/song-duration/song-duration.module";
export * from "./lib/pipes/song-duration/song-duration.pipe";
export * from "./lib/pipes/added-to-playlist/added-to-playlist.module";
export * from "./lib/pipes/added-to-playlist/added-to-playlist.pipe";
export * from "./lib/pipes/bucket-flag-pipe/bucket-flag-pipe.module";
export * from "./lib/pipes/bucket-flag-pipe/bucket-flag-pipe.pipe";
export * from "./lib/pipes/bytes-pipe/bytes-pipe.module";
export * from "./lib/pipes/bytes-pipe/bytes-pipe.pipe";

// Datasource
export * from "./lib/entities/playable-list.entity";
export * from "./lib/utils/builder/playable-list.builder";
export * from "./lib/utils/datasource/datasourcev2";
export * from "./lib/utils/datasource/datasource";

// Notifications
export * from "./lib/components/notification/notification-list-item/notification-list-item.module";
export * from "./lib/components/notification/notification-list-item/notification-list-item.component";

// Dialog
// export * from "./lib/ui/dialog/dialog.module";
// export * from "./lib/ui/dialog/services/dialog.service";
export * from "./lib/ui/dialog/dialogs/template/dialog-template.component";
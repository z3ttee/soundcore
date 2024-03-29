// Lottie animations
import lottieAudioWave from "./assets/lottie/audio_wave.json";
export const scngxLottieAudioWave = lottieAudioWave;

/*
 * Public API Surface of soundcore-ngx
 */
export { SCNGXModule } from "./lib/scngx.module";

// Scroll Module
export * from "./lib/components/scrolling";

// Table Module
export * from "./lib/table";

// Button module
export * from "./lib/components/buttons";

// UI Module
export * from "./lib/ui";

// Drawer
export * from "./lib/components/drawer/drawer.module";
export * from "./lib/components/drawer/drawer.component";

// Utils
export * from "./lib/utils/queue";

// Lists
export * from "./lib/components/list";

// Divider
export * from "./lib/components/divider";


// Dialog
export * from "./lib/dialog/dialog.module";
export * from "./lib/dialog/services/dialog.service";
export * from "./lib/dialog/entities/dialog-ref.entity";
export * from "./lib/dialog/entities/dialog-config.entity";
export * from "./lib/dialog/components/template/template.component";
export * from "./lib/dialog/components/dialog-section/dialog-section.component";

// Forms
export * from "./lib/components/forms/forms.module";
export * from "./lib/components/forms/label/label.module";
export * from "./lib/components/forms/hint/hint.module";
export * from "./lib/components/forms/text-input/text-input.module";

export * from "./lib/components/forms/label/label.component";
export * from "./lib/components/forms/hint/hint.component";
export * from "./lib/components/forms/text-input/text-input.component";

// Skeletons
export * from "./lib/components/skeletons/skeleton/skeleton.module";
export * from "./lib/components/skeletons/skeleton/skeleton.component";

// Tooltip
export * from "./lib/ui/tooltip/tooltip.module";
export * from "./lib/ui/tooltip/directive/tooltip.directive";

// Navigation
export * from "./lib/components/navigation/bottom-nav/bottom-nav.module";
export * from "./lib/components/navigation/bottom-nav/bottom-nav.component";
export * from "./lib/components/navigation/bottom-nav/item-component/item-component.component";

// Toolbar
export * from "./lib/components/toolbar/toolbar.module";
export * from "./lib/components/toolbar/toolbar.component";

// Tabbar
export * from "./lib/components/navigation/tabbar/tabbar.module";
export * from "./lib/components/navigation/tabbar/tabbar.component";
export * from "./lib/components/navigation/tabbar/tab-item/tab-item.component";

// Grid items
export * from "./lib/components/grid/resource-grid-item/resource-grid-item.module";
export * from "./lib/components/grid/resource-grid-item/resource-grid-item.component";

export * from "./lib/components/grid/collection-grid-item/collection-grid-item.module";
export * from "./lib/components/grid/collection-grid-item/collection-grid-item.component";

export * from "./lib/components/grid/playlist-grid-item/playlist-grid-item.module";
export * from "./lib/components/grid/playlist-grid-item/playlist-grid-item.component";

export * from "./lib/components/grid/album-grid-item/album-grid-item.module";
export * from "./lib/components/grid/album-grid-item/album-grid-item.component";

export * from "./lib/components/grid/artist-grid-item/artist-grid-item.module";
export * from "./lib/components/grid/artist-grid-item/artist-grid-item.component";

// Rows
export * from "./lib/ui/ui-row/ui-row.module";
export * from "./lib/ui/ui-row/ui-row.component";

// Grids
export * from "./lib/components/grids/vertical-grid/vertical-grid.module";
export * from "./lib/components/grids/vertical-grid/vertical-grid.component";

export * from "./lib/components/grid/profile-grid-item/profile-grid-item.module";
export * from "./lib/components/grid/profile-grid-item/profile-grid-item.component";

// Image exports
export * from "./lib/components/images/artwork/artwork.module";
export * from "./lib/components/images/artwork/artwork.component";

// Progress
export * from "./lib/components/progress/progressbar/progressbar.module";
export * from "./lib/components/progress/progressbar/progressbar.component";

// Badges
export * from "./lib/components/badges/explicit-badge/explicit-badge.module";
export * from "./lib/components/badges/explicit-badge/explicit-badge.component";

export * from "./lib/components/badges/status-indicator/status-indicator.module";
export * from "./lib/components/badges/status-indicator/status-indicator.component";

// Pipes
export * from "./lib/pipes/song-duration/song-duration.module";
export * from "./lib/pipes/song-duration/song-duration.pipe";
export * from "./lib/pipes/added-to-playlist/added-to-playlist.module";
export * from "./lib/pipes/added-to-playlist/added-to-playlist.pipe";
export * from "./lib/pipes/bytes-pipe/bytes-pipe.module";
export * from "./lib/pipes/bytes-pipe/bytes-pipe.pipe";
export * from "./lib/pipes/file-flag-pipe/file-flag-pipe.module";
export * from "./lib/pipes/file-flag-pipe/file-flag-pipe.pipe";
export * from "./lib/pipes/mount-status-pipe/mount-status-pipe.module";
export * from "./lib/pipes/mount-status-pipe/mount-status-pipe.pipe";
export * from "./lib/pipes/resource-type-pipe/resource-type-pipe.module";
export * from "./lib/pipes/resource-type-pipe/resource-type-pipe.pipe";

export * from "./lib/pipes";

// Notifications
export * from "./lib/components/notification/notification-list-item/notification-list-item.module";
export * from "./lib/components/notification/notification-list-item/notification-list-item.component";
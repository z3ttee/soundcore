import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BucketsComponent } from './views/buckets-page/buckets.component';
import { RouterModule, Routes } from '@angular/router';
import { MountListItemComponent } from './components/mount-list-item/mount-list-item.component';
import { BucketService } from './services/bucket.service';
import { MountService } from './services/mount.service';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { BucketInfoComponent } from './views/bucket-info/bucket-info.component';
import { BucketListItemComponent } from './components/bucket-list-item/bucket-list-item.component';
import { AppCommonModule } from 'src/app/common.module';
import { MountStatusService } from './services/mount-status.service';
import { AscMessageModule } from 'src/app/components/message-components/message-components.module';
import { MountInfoComponent } from './views/mount-info/mount-info.component';
import { IndexService } from './services/index.service';
import { IndexInfoComponent } from './views/index-info/index-info.component';
import { AscInterfaceListItemTemplateModule } from 'src/app/components/list-items/interface-list-item-template/interface-list-item-template.module';
import { AscInterfaceListModule } from 'src/app/components/lists/interface-list/interface-list.module';
import { AscBadgeModule } from 'src/app/components/badge-components/badge-components.module';
import { IndexListItemComponent } from './components/index-list-item/index-list-item.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MountEditorDialog } from './dialogs/mount-editor/mount-editor.dialog';

const routes: Routes = [

  { path: "", component: BucketsComponent},
  { path: "bucket/:bucketId", component: BucketInfoComponent },
  { path: "mount/:mountId", component: MountInfoComponent },
  { path: "index/:indexId", component: IndexInfoComponent }

]

@NgModule({
  declarations: [
    BucketsComponent,
    MountListItemComponent,
    MountEditorDialog,
    BucketInfoComponent,
    BucketListItemComponent,
    IndexListItemComponent,
    MountInfoComponent,
    IndexInfoComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    PipesModule,
    AscMessageModule,
    AscInterfaceListItemTemplateModule,
    AscInterfaceListModule,
    AscBadgeModule,

    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  providers: [
    BucketService,
    MountService,
    MountStatusService,
    IndexService
  ]
})
export class StorageModule { }

import { NgModule } from '@angular/core';
import { StorageItemTypePipe } from './storage-item-type.pipe';

@NgModule({
  declarations: [
    StorageItemTypePipe
  ],
  exports: [
    StorageItemTypePipe
  ]
})
export class StorageItemTypePipeModule { }

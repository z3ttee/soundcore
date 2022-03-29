import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bucket } from 'src/app/features/storage/entities/bucket.entity';
import { Mount } from 'src/app/features/storage/entities/mount.entity';
import { BucketService } from 'src/app/features/storage/services/bucket.service';
import { MountService } from 'src/app/features/storage/services/mount.service';
import { CreateImportComponent } from '../../dialogs/create-import/create-import.component';
import { ImportEntity } from '../../entities/import.entity';
import { ImportService } from '../../services/import.service';

@Component({
  templateUrl: './import-youtube.component.html',
  styleUrls: ['./import-youtube.component.scss']
})
export class ImportYoutubeComponent implements OnInit {

  private _bucketsSubject: BehaviorSubject<Bucket[]> = new BehaviorSubject([]);
  private _mountsSubject: BehaviorSubject<Mount[]> = new BehaviorSubject([]);

  // Data providers
  public $buckets: Observable<Bucket[]> = this._bucketsSubject.asObservable();
  public $mounts: Observable<Mount[]> = this._mountsSubject.asObservable();
  public $imports: Observable<ImportEntity[]> = this.importService.$imports;

  // Forms
  public selectedBucketControl: FormControl = new FormControl();
  public selectedMountControl: FormControl = new FormControl();
  public selectedUrlControl: FormControl = new FormControl(null, [ Validators.required ]);

  // Loading states
  public isLoadingBuckets: boolean = false;
  public isLoadingMounts: boolean = false;

  constructor(
    private bucketService: BucketService,
    private mountService: MountService,
    private importService: ImportService,
    private dialog: MatDialog
  ) { }

  public ngOnInit(): void {
    this.isLoadingBuckets = true
    /*this.bucketService.findBuckets().then((page) => {
      this._bucketsSubject.next(page.elements);
    }).finally(() => this.isLoadingBuckets = false)

    this.selectedBucketControl.valueChanges.subscribe((value) => {
      this.isLoadingMounts = true;

      this.mountService.findMountsByBucketId(value).then((page) => {
        this._mountsSubject.next(page.elements);
      }).finally(() => this.isLoadingMounts = false)
    })*/

  }

  public async submit() {
    this.importService.createImport({
      url: this.selectedUrlControl.value,
      mountId: this.selectedMountControl.value
    })
  }

  public async openCreateDialog() {
    this.dialog.open(CreateImportComponent)
  }

}

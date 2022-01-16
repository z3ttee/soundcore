import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageBucket } from 'src/app/features/storage/model/storage-bucket.model';
import { StorageMount } from 'src/app/features/storage/model/storage-mount.model';
import { BucketService } from 'src/app/features/storage/services/bucket.service';
import { MountService } from 'src/app/features/storage/services/mount.service';
import { ImportService } from '../../services/import.service';

@Component({
  templateUrl: './import-index.component.html',
  styleUrls: ['./import-index.component.scss']
})
export class ImportIndexComponent implements OnInit {

  private _bucketsSubject: BehaviorSubject<StorageBucket[]> = new BehaviorSubject([]);
  private _mountsSubject: BehaviorSubject<StorageMount[]> = new BehaviorSubject([]);

  // Data providers
  public $buckets: Observable<StorageBucket[]> = this._bucketsSubject.asObservable();
  public $mounts: Observable<StorageMount[]> = this._mountsSubject.asObservable();

  // Forms
  public selectedBucketControl: FormControl = new FormControl();
  public selectedMountControl: FormControl = new FormControl();
  public selectedUrlControl: FormControl = new FormControl(null, [ Validators.required ]);
  public selectedStartTime: FormControl = new FormControl(0);

  // Loading states
  public isLoadingBuckets: boolean = false;
  public isLoadingMounts: boolean = false;

  constructor(
    private bucketService: BucketService,
    private mountService: MountService,
    private importService: ImportService
  ) { }

  public ngOnInit(): void {

    this.isLoadingBuckets = true
    this.bucketService.findAllBuckets().then((page) => {
      this._bucketsSubject.next(page.elements);
    }).finally(() => this.isLoadingBuckets = false)

    this.selectedBucketControl.valueChanges.subscribe((value) => {
      this.isLoadingMounts = true;

      this.mountService.findMountsByBucketId(value).then((page) => {
        this._mountsSubject.next(page.elements);
      }).finally(() => this.isLoadingMounts = false)
    })

  }

  public async submit() {
    this.importService.createImport({
      url: this.selectedUrlControl.value,
      mountId: this.selectedMountControl.value,
      startTime: this.selectedStartTime.value
    })
  }

}

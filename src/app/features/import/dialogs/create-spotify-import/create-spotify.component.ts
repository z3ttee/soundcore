import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bucket } from 'src/app/features/storage/entities/bucket.entity';
import { Mount } from 'src/app/features/storage/entities/mount.entity';
import { BucketService } from 'src/app/features/storage/services/bucket.service';
import { MountService } from 'src/app/features/storage/services/mount.service';
import { ImportService } from '../../services/import.service';

@Component({
  templateUrl: './create-spotify.component.html',
  styleUrls: ['./create-spotify.component.scss']
})
export class CreateSpotifyDialogComponent implements OnInit {

  private _bucketsSubject: BehaviorSubject<Bucket[]> = new BehaviorSubject([]);
  private _mountsSubject: BehaviorSubject<Mount[]> = new BehaviorSubject([]);

  // Data providers
  public $buckets: Observable<Bucket[]> = this._bucketsSubject.asObservable();
  public $mounts: Observable<Mount[]> = this._mountsSubject.asObservable();

  // Loading states
  public isLoadingBuckets: boolean = false;
  public isLoadingMounts: boolean = false;
  public isSaving: boolean = false;

  // Forms
  public selectedBucketControl: FormControl = new FormControl();

  public createImportDto: FormGroup = new FormGroup({
    url: new FormControl(null, [ Validators.required ]),
    title: new FormControl(null),
    artists: new FormControl(null),
    albums: new FormControl(null),
    mountId: new FormControl(null)
  })

  // Error handling
  public error: any;

  constructor(
    private bucketService: BucketService,
    private mountService: MountService,
    private importService: ImportService,
    private dialogRef: MatDialogRef<CreateSpotifyDialogComponent>
  ) { }

  ngOnInit(): void {
    this.isLoadingBuckets = true
    /*this.bucketService.findAllBuckets().then((page) => {
      this._bucketsSubject.next(page.elements);
    }).finally(() => this.isLoadingBuckets = false)

    this.selectedBucketControl.valueChanges.subscribe((value) => {
      this.isLoadingMounts = true;

      this.mountService.findMountsByBucketId(value).then((page) => {
        this._mountsSubject.next(page.elements);
      }).finally(() => this.isLoadingMounts = false)
    })*/
  }

  public onSave() {
    this.error = null;

    if(!this.createImportDto.valid) {
      this.error = "Bitte f??lle alle Felder aus."
      return;
    }

    this.isSaving = true;
    this.importService.findSongsBySpotifyPlaylist(this.createImportDto.get("url").value).finally(() => {
      this.isSaving = false;
    })
    /*this.importService.createImport({
      url: this.createImportDto.get("url").value,
      title: this.createImportDto.get("title").value,
      mountId: this.createImportDto.get("mountId").value,
      artists: this.createImportDto.get("artists").value?.split(","),
      albums: this.createImportDto.get("albums").value?.split(",")
    }).then(() => {
      this.dialogRef.close();
    }).catch((error) => {
      this.error = error;
    }).finally(() => {
      this.isSaving = false;
    })*/

  }

}

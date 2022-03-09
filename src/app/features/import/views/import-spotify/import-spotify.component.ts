import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bucket } from 'src/app/features/storage/entities/bucket.entity';
import { Mount } from 'src/app/features/storage/entities/mount.entity';
import { CreateSpotifyDialogComponent } from '../../dialogs/create-spotify-import/create-spotify.component';
import { ImportEntity } from '../../entities/import.entity';
import { ImportService } from '../../services/import.service';

@Component({
  templateUrl: './import-spotify.component.html',
  styleUrls: ['./import-spotify.component.scss']
})
export class ImportSpotifyComponent implements OnInit {

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
    private importService: ImportService,
    private dialog: MatDialog
  ) { }

  public ngOnInit(): void {
    this.isLoadingBuckets = true
  }

  public async submit() {
    this.importService.createImport({
      url: this.selectedUrlControl.value,
      mountId: this.selectedMountControl.value
    })
  }

  public async openCreateDialog() {
    this.dialog.open(CreateSpotifyDialogComponent)
  }

}

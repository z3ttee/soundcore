import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Mount, SCDKMountService } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mount-info',
  templateUrl: './mount-info.component.html',
  styleUrls: ['./mount-info.component.scss']
})
export class MountInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly mountService: SCDKMountService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  
  private readonly _destroy: Subject<void> = new Subject();
  private readonly _mountSubject: BehaviorSubject<Mount> = new BehaviorSubject(null);

  public readonly $loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public readonly $mount: Observable<Mount> = this._mountSubject.asObservable();

  public infiniteFetchUrl: string = "";
  public readonly infinitePageSize: number = 30;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((params) => {
      const mountId = params.get("mountId");

      this._mountSubject.next(null);
      this.$loading.next(true);

      this.infiniteFetchUrl = `${environment.api_base_uri}/v1/files/mounts/${mountId}`;

      this.mountService.findById(mountId).pipe(takeUntil(this._destroy)).subscribe((mount) => {
        this.$loading.next(false);
        this._mountSubject.next(mount);
      });
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

}

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Bucket, SCDKBucketService, SCDKMountService } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './zone-info.component.html',
  styleUrls: ['./zone-info.component.scss'],
})
export class ZoneInfoComponent implements OnInit, OnDestroy {

  constructor(
    private readonly zoneService: SCDKBucketService,
    private readonly mountService: SCDKMountService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  private readonly _destroy: Subject<void> = new Subject();
  private readonly _zoneSubject: BehaviorSubject<Bucket> = new BehaviorSubject(null);

  public readonly $loading = new BehaviorSubject(false);
  public readonly $zone = this._zoneSubject.asObservable();

  public infiniteFetchUrl: string = "";
  public readonly infinitePageSize: number = 30;

  public ngOnInit(): void {
    // Observe route params changes and get new zoneId
    this.activatedRoute.paramMap.pipe(takeUntil(this._destroy)).subscribe((params) => {
      const zoneId = params.get("zoneId");

      this.infiniteFetchUrl = `${environment.api_base_uri}/v1/mounts/bucket/${zoneId}`;

      // Set loading state
      this.$loading.next(true);

      // Fetch zone by id
      this.zoneService.findById(zoneId).pipe(takeUntil(this._destroy)).subscribe((zone) => {
        this._zoneSubject.next(zone);
        this.$loading.next(false);

        
      });
    })
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }


  public vsEnd() {
    console.log("end")

  }

  public vsStart() {
    console.log("start")
    
  }

  public vsUpdate() {
      console.log("update")
  }

  public vsChange() {
    console.log("change")
  }



}

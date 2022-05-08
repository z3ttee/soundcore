import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SCNGXScreenService } from 'soundcore-ngx';
import { Artwork, SCDKResource } from "soundcore-sdk";

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent implements OnInit, OnDestroy {

  constructor(
    public readonly screenService: SCNGXScreenService
  ) { }

  @Input() public title: string;
  @Input() public artwork: Artwork;
  @Input() public isLoading: boolean = false;
  @Input() public resource: SCDKResource;

  private $destroy: Subject<void> = new Subject();
  public $isTouch: Observable<boolean> = this.screenService.$isTouch.pipe(takeUntil(this.$destroy));

  public ngOnInit(): void {}
  public ngOnDestroy(): void {
      this.$destroy.complete();
      this.$destroy.next();
  }

}

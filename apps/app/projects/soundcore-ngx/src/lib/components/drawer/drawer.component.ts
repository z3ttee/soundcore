import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SCCDKScreenService } from '@soundcore/cdk';

export type SCNGXDrawerMode = "push" | "over";

@Component({
  selector: 'scngx-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class SCNGXDrawerComponent implements OnInit, AfterViewInit {

  private readonly _destroy: Subject<void> = new Subject();
  public readonly $screen = this.screenService.$screen.pipe(takeUntil(this._destroy));

  // TODO: Update computedMode if mode has changed
  @Input() public mode: SCNGXDrawerMode = "push";
  @Input() public hasBackdrop: boolean = true;
  @Input() public toggleOnNavigation: boolean = true;

  constructor(
    private readonly screenService: SCCDKScreenService,
    private readonly router: Router
  ) { }

  public isCollapsed: boolean = this.screenService.isMobile();
  public computedMode: SCNGXDrawerMode = this.screenService.isMobile() ? "over" : this.mode;

  public ngOnInit(): void {
    this.router.events.pipe(takeUntil(this._destroy)).subscribe((event) => {
      if(event instanceof NavigationStart) {
        if(this.toggleOnNavigation && this.computedMode == "over") {
          this.isCollapsed = true;
        }
      }
    })

    this.$screen.pipe(takeUntil(this._destroy)).subscribe((screen) => {      
      if(screen.isMobile) {
        // Always set mode to "over"
        // on touch devices
        this.computedMode = "over";
        this.isCollapsed = true;
      } else {
        this.computedMode = this.mode;

        if(this.mode == "over") {
          this.isCollapsed = true;
        } else {
          // Mode: PUSH
          const pivotScreenWidth = this.screenService.findBreakpointByName("md");
          this.isCollapsed = screen.width <= pivotScreenWidth;
        }
      }
    })
  }
  public ngAfterViewInit(): void {}

  public hide() {
    this.isCollapsed = true;
  }
  public show() {
    this.isCollapsed = false;
  }
  public toggle() {
    this.isCollapsed = !this.isCollapsed;
  }
  public handleDismiss() {
    if(this.isCollapsed) return;
    this.isCollapsed = true;
  }

}

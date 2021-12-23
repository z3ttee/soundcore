import { Component, Input, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter, Observable, tap } from 'rxjs';
import { Breakpoint, DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'asc-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent implements OnInit {

    @Input() public opened: boolean = true;
    public mode: "push" | "over" = "push";
    @Input() public hasBackdrop: boolean = true;

    private $breakpoint: Observable<Breakpoint>;

    constructor(private router: Router, private deviceService: DeviceService) {
        this.$breakpoint = this.deviceService.$breakpoint;
    }

    public ngOnInit(): void {
        this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
            const breakpoint = this.deviceService.getBreakpoint();

            // Close drawer on navigation on mobile breakpoints
            if(breakpoint.name == "sm" || breakpoint.name == "md") {
                this.close();
            } else {
                if(this.mode == "over") {
                    this.close();
                }
            }
        })

        this.$breakpoint.subscribe(() => {
            if(this.deviceService.isCurrentSmallerThan("lg")) {
                this.close();
            } else {
                if(this.mode == "over") { 
                    this.close();
                } else {
                    this.open();
                }
            }
        })
    }

    public get canShowBackdrop() {
        return this.hasBackdrop && this.opened;
    }

    public open(): void {
        if(!this.opened) this.opened = true
    }
    public close(): void {
        if(this.opened) this.opened = false
    }
    public toggle(): void {
        if (!this.opened) this.open();
        else this.close();
    }

}

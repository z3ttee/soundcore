import { Component, Input, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'asc-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent implements OnInit {

    @Input() public opened: boolean = true;
    @Input() public mode: "push" | "over" = "push";
    @Input() public hasBackdrop: boolean = true;

    constructor(private router: Router) {}

    public ngOnInit(): void {
        this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
            // TODO: Close drawer on tailwindcss mobile breakpoints
            console.log("drawer should close on mobile because of navigation start")
            /*if(breakpoint.name == "sm" || breakpoint.name == "md") {
                this.close();
            } else {
                if(this.mode == "over") {
                    this.close();
                }
            }*/
        })

        // TODO: Close drawer on tailwindcss mobile breakpoints
        /*if(this.$store.state.wydget.breakpoint.name == "sm" || this.$store.state.wydget.breakpoint.name == "md") {
            this.opened = false;
        }*/
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

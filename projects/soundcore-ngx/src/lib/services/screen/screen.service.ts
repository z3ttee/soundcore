import { Platform } from "@angular/cdk/platform";
import { Inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, fromEvent, Observable, Subject, takeUntil } from "rxjs";

import { SCNGXOptions, SCNGX_OPTIONS } from "../../scngx.module";
import { SCNGXScreen } from "./entities/screen.entity";

@Injectable()
export class SCNGXScreenService implements OnDestroy {

    private screens: Record<string, number> = {};

    private destroy$ = new Subject<void>();
    private $event = fromEvent(window, "resize").pipe(takeUntil(this.destroy$))

    private _isTouchSubject: BehaviorSubject<boolean> = new BehaviorSubject(this.isMobile());
    private _screenSubject: BehaviorSubject<SCNGXScreen> = new BehaviorSubject(this.getScreen());

    public $isTouch: Observable<boolean> = this._isTouchSubject.asObservable();
    public $screen: Observable<SCNGXScreen> = this._screenSubject.asObservable();

    constructor(
        private readonly platform: Platform,
        @Inject(SCNGX_OPTIONS) private readonly options: SCNGXOptions
    ) {
        if(!options) throw new Error("You need to initialize the SCNGX library first. This is done by adding SCNGXModule.register(...) to your imports in app.module.ts")

        const screens = this.options.screen.screens.sort((a, b) => b.width - a.width);
        for(const screen of screens) {
            this.screens[screen.name] = screen.width;
        }

        this.init();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async init() {
        this._screenSubject.next(this.getScreen())

        this.$event.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const currentScreen = this._screenSubject.getValue();
            const screen = this.getScreen();
            const isTouch = this.isMobile();

            if(currentScreen?.name !== screen?.name){
                this._screenSubject.next(screen);
            }

            if(this._isTouchSubject.getValue() !== isTouch) {
                this._isTouchSubject.next(isTouch);
            }
        })
    }

    /**
     * Get breakpoint width information by breakpoint's name.
     * @param bpName Name of the breakpoint
     * @returns number
     */
    public findBreakpointByName(bpName: string): number {
        return this.screens[bpName] || this.screens[0];
    }


    public isMobile(): boolean {       
        return this.platform.ANDROID || this.platform.IOS;
    }

    /**
     * Get breakpoint's name of current screen width.
     * @param width Screen's width
     * @returns String
     */
    public getBreakpointNameByWidth(width: number): string {
        for(const key in this.screens) {
            if(this.screens[key] <= width) {
                return key;
            }
        }
    
        return Object.keys(this.screens)[Object.keys(this.screens).length - 1];
    }

    private getScreen(): SCNGXScreen {
        const name = this.getBreakpointNameByWidth(window.innerWidth);
        const breakpoint = this.findBreakpointByName(name);

        return new SCNGXScreen(name, this.isMobile(), breakpoint);
    }

}
import { Inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, debounceTime, fromEvent, Observable, Subject, takeUntil } from "rxjs";

import { SCNGXOptions, SCNGX_OPTIONS } from "../../scngx.module";
import { SCNGXScreen } from "./screen.module";

@Injectable()
export class SCNGXScreenService implements OnDestroy {

    private screens: Record<string, number> = {};

    private destroy$ = new Subject<void>();
    private $event = fromEvent(window, "resize").pipe(debounceTime(100), takeUntil(this.destroy$))

    private _isTouchSubject: BehaviorSubject<boolean> = new BehaviorSubject(this.isTouch());
    private _screenSubject: BehaviorSubject<SCNGXScreen> = new BehaviorSubject(this.getScreen());

    public $isTouch: Observable<boolean> = this._isTouchSubject.asObservable();
    public $screen: Observable<any> = this._screenSubject.asObservable();

    constructor(
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
            this._isTouchSubject.next(this.isTouch())
            this._screenSubject.next(this.getScreen())
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


    private isTouch(): boolean {       
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(navigator.userAgent))
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

        return {
            isTouch: this.isTouch(),
            name,
            height: window.innerHeight,
            width: window.innerWidth
        }
    }

}
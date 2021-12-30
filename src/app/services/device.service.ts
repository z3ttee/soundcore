import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import resolveConfig from 'tailwindcss/resolveConfig'
import { TailwindConfig } from "tailwindcss/tailwind-config";
import tailwindConfig from "../../../tailwind.config.js"

// const tailwindConfig = require("../../tailwind.config.js");

export type Breakpoint = {
    name: string;
    triggerWidth: number;
    width: number;
    height: number;
    isMobile: boolean;
}

@Injectable({
    providedIn: "root"
})
export class DeviceService implements OnInit {
    private _breakpointSubject: BehaviorSubject<Breakpoint>;

    private _tailwindConfig: TailwindConfig = resolveConfig(tailwindConfig);
    private _breakpoints: Record<string, number>;

    public $breakpoint: Observable<Breakpoint>;

    constructor() {
        // Transform breakpoints from tailwind
        const screens = this._tailwindConfig.theme.screens;
        for(const key in screens) {
            screens[key] = parseInt(screens[key]["min-width"]?.replace("px", ""));
        }

        this._breakpoints = Object.fromEntries(
            Object.entries(screens).sort((a, b) => parseInt(b[1] as string) - parseInt(a[1] as string))
        );

        this._breakpointSubject = new BehaviorSubject(this.computeBreakpoint());
        this.$breakpoint = this._breakpointSubject.asObservable();

        this.updateBreakpoint();
        window.addEventListener("resize", () => this.onResizeEvent());
    }

    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Get breakpoint's name of current screen width.
     * @param width Screen's width
     * @returns String
     */
    public getBreakpointNameByWidth(width: number): string {
        for(const key in this._breakpoints) {
            if(this._breakpoints[key] <= width) {
                return key;
            }
        }
    
        return Object.keys(this._breakpoints)[Object.keys(this._breakpoints).length - 1];
    }

    /**
     * Get breakpoint width information by breakpoint's name.
     * @param bpName Name of the breakpoint
     * @returns number
     */
    public findBreakpointByName(bpName: string): number {
        return this._breakpoints[bpName] || this._breakpoints[0];
    }

    /**
     * Check if a breakpoint with name is greater than the current active breakpoint.
     * @param name Name of the breakpoint to compare.
     * @returns True or False
     */
    public isCurrentSmallerThan(name: string): boolean {
        const pivotVal = this.findBreakpointByName(name);
        const currentVal = this._breakpointSubject.getValue().width;
        
        return currentVal < pivotVal;
    }

    /**
     * Check if a breakpoint with name is smaller than the current active breakpoint.
     * @param name Name of the breakpoint to compare.
     * @returns True or False
     */
    public isCurrentTallerThan(name: string): boolean {
        const pivotVal = this.findBreakpointByName(name);
        const currentVal = this._breakpointSubject.getValue().width;
        
        return currentVal > pivotVal;
    }

    /**
     * Get current value of the observable.
     * @returns Breakpoint
     */
    public getBreakpoint(): Breakpoint {
        return this._breakpointSubject.getValue();
    }

    /**
     * Resize event handler
     */
    public onResizeEvent() {
        this.updateBreakpoint();
    }

    /**
     * Update current breakpoint value.
     */
    private updateBreakpoint() {
        this._breakpointSubject.next(this.computeBreakpoint())
    }

    /**
     * Compute new breakpoint given the current values on the window.
     * @returns Breakpoint
     */
    private computeBreakpoint(): Breakpoint {
        const name = this.getBreakpointNameByWidth(window.innerWidth);
        const triggerWidth = this.findBreakpointByName(name);

        return { name, triggerWidth, width: window.innerWidth, height: window.innerHeight, isMobile: this.isMobile() }
    }

    /**
     * Most simple way to check if user agent belongs to mobile device (very unreliable as manipulating the ua causes different outcomes...)
     * @returns True or False
     */
    private isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(navigator.userAgent)
    }

}
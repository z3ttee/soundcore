import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { Injectable, TemplateRef, ViewContainerRef } from "@angular/core";
import { MatBottomSheet, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { filter, fromEvent, take } from "rxjs";
import { DeviceService } from "./device.service";

@Injectable({
    providedIn: "root"
})
export class ContextMenuService {
    
    private overlayRef?: OverlayRef;
    private bottomSheetRef?: MatBottomSheetRef;

    constructor(
        private overlay: Overlay,
        private bottomSheet: MatBottomSheet,
        private deviceService: DeviceService
    ) {
        fromEvent<MouseEvent>(document, 'click').pipe(filter(event => {
                const clickTarget = event.target as HTMLElement;
                return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
            })
        ).subscribe(() => {
            this.close()
        })
    }

    public async open(event: MouseEvent, template: TemplateRef<any>, viewContainerRef: ViewContainerRef, contextData?: any) {
        event.preventDefault();
        event.stopPropagation();

        await this.close();

        this.deviceService.$breakpoint.pipe(take(1)).subscribe((breakpoint) => {
            if(!breakpoint.isDesktop) {
                // Show bottom sheet on mobile devices
                this.bottomSheet.open(template, { viewContainerRef, closeOnNavigation: true, data: contextData, panelClass: ["bg-transparent", "shadow-none"] })
                return;
            }

            // Show context menu on desktop devices
            const positionStrategy = this.overlay.position().flexibleConnectedTo({ x: event.x, y: event.y }).withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                }
            ]);
            this.overlayRef = this.overlay.create({ positionStrategy, scrollStrategy: this.overlay.scrollStrategies.close() });
    
            this.overlayRef.attach(new TemplatePortal(template, viewContainerRef, {
                $implicit: contextData
            }));
        })

        
    }

    public async close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }

        if (this.bottomSheetRef) {
            this.bottomSheetRef.dismiss();
            this.bottomSheetRef = null;
        }
    }

}
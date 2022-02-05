import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { Injectable, TemplateRef, ViewContainerRef } from "@angular/core";
import { filter, fromEvent } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class ContextMenuService {
    
    private overlayRef: OverlayRef | null;

    constructor(
        private overlay: Overlay
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
    }

    public async close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }

}
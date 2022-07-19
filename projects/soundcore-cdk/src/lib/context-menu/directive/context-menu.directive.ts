import { Directive, ElementRef, EmbeddedViewRef, HostListener, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subject } from "rxjs";
import { SCCDKContextService } from "../services/context-menu.service";

@Directive({
    selector: "[sccdkContext]"
})
export class SCCDKContextMenuDirective implements OnInit, OnDestroy {
    private readonly _destroy: Subject<void> = new Subject();
    private embeddedView: EmbeddedViewRef<any>;

    @Input() public sccdkContext: TemplateRef<any>;

    constructor(
        private readonly contextMenuService: SCCDKContextService,
        private readonly viewContainerRef: ViewContainerRef,
        private readonly elementRef: ElementRef
    ) {}

    public ngOnInit(): void {
        // Set hosts position property to relative.
        // This allows to place the context menu
        // using css rules
        const target = this.elementRef.nativeElement;
        Object.assign(target.style, {
            position: "relative"
        })
    }

    public ngOnDestroy(): void {
        // Detach context menu
        this.embeddedView?.detach();

        this._destroy.next();
        this._destroy.complete();
    }

    @HostListener("contextmenu", ['$event'])
    public onContext(event: PointerEvent) {
        this.contextMenuService.open(event, this.sccdkContext, this.viewContainerRef);
    }

}
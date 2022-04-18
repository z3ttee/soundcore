import { Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { autoPlacement, computePosition, flip, Placement, shift } from '@floating-ui/dom';
import { SCNGXTooltipComponent } from '../components/tooltip.component';

@Directive({
  selector: '[scngxTooltip]'
})
export class SCNGXTooltipDirective implements OnDestroy, OnInit {

  private _tooltip: HTMLElement;

  @Input() public scngxTooltipText: string;
  @Input() public scngxTooltipPosition: Placement;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly zone: NgZone
  ) {}

  public ngOnInit(): void {
    const host = this.prepareHost();
    this._tooltip = this.prepareTooltip();

    computePosition(host, this._tooltip, {
      placement: this.scngxTooltipPosition || "bottom",
      middleware: [
        shift(),
        flip()
      ]
    }).then(({x, y}) => {   
      Object.assign(this._tooltip.style, {
        left: `${x}px`,
        top: `${y}px`
      })
    })
  }

  public ngOnDestroy(): void {
    this._tooltip?.remove();
    // this.elementRef.nativeElement.removeEventListener("mouseenter",)
  }

  public onMouseEnter(event: MouseEvent) {
    this.zone.run(() => {
      this._tooltip.style.opacity = "1"
      this._tooltip.classList.add("scale-100")
    })
  }

  public onMouseLeave(event: MouseEvent) {
    this.zone.run(() => {
      this._tooltip.style.opacity = "0"
      this._tooltip.classList.remove("scale-100")
    })
  }

  private prepareHost(): HTMLElement {
    const host = this.elementRef.nativeElement;
    // host.classList.add("transition-all", "transform-gpu", "will-change-transform")
    // host.style.opacity = "0"
    host.addEventListener("mouseenter", (event) => this.onMouseEnter(event))
    host.addEventListener("mouseleave", (event) => this.onMouseLeave(event))

    return host;
  }

  private prepareTooltip(): HTMLElement {
    // Create component
    const componentRef = this.viewContainerRef.createComponent(SCNGXTooltipComponent);
    componentRef.instance.text = this.scngxTooltipText;

    // Create tooltip html element
    const tooltip = componentRef.location.nativeElement;

    // Add initial styling
    tooltip.classList.add("transition-all", "transform-gpu", "will-change-transform", "opacity-0", "pointer-events-none", "scale-95")
    tooltip.style.position = "absolute";

    return tooltip;
  }

}

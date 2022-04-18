import { Directive, ElementRef, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { computePosition, flip, Placement, shift } from '@floating-ui/dom';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { SCNGXTooltipComponent } from '../components/tooltip.component';

const SCALE_BEGIN_CLASS = "scale-95";
const SCALE_END_CLASS = "scale-100";

@Directive({
  selector: '[scngxTooltip]'
})
export class SCNGXTooltipDirective implements OnDestroy, OnInit {

  private _destroy: Subject<void> = new Subject();
  private _tooltip: HTMLElement;

  @Input() public scngxTooltipText: string;
  @Input() public scngxTooltipPosition: Placement;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  public ngOnInit(): void {
    const host = this.prepareHost();
    this._tooltip = this.prepareTooltip();

    fromEvent<MouseEvent>(host, "mouseenter").pipe(takeUntil(this._destroy)).subscribe((event) => this.onMouseEnter(event));
    fromEvent<MouseEvent>(host, "mouseleave").pipe(takeUntil(this._destroy)).subscribe((event) => this.onMouseLeave(event));

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
    this._destroy.next();
    this._destroy.complete();
  }

  private onMouseEnter(event: MouseEvent) {
    this._tooltip.style.opacity = "1"
    this._tooltip.classList.remove(SCALE_BEGIN_CLASS)
    this._tooltip.classList.add(SCALE_END_CLASS)
  }

  private onMouseLeave(event: MouseEvent) {
    this._tooltip.style.opacity = "0"
    this._tooltip.classList.remove(SCALE_END_CLASS)
    this._tooltip.classList.add(SCALE_BEGIN_CLASS)
  }

  private prepareHost(): HTMLElement {
    const host = this.elementRef.nativeElement;
    return host;
  }

  private prepareTooltip(): HTMLElement {
    // Create component
    const componentRef = this.viewContainerRef.createComponent(SCNGXTooltipComponent);
    componentRef.instance.text = this.scngxTooltipText;

    // Create tooltip html element
    const tooltip = componentRef.location.nativeElement;

    // Add initial styling
    tooltip.classList.add("transition-all", "transform-gpu", "will-change-transform", "opacity-0", "pointer-events-none", SCALE_BEGIN_CLASS)
    tooltip.style.position = "absolute";

    return tooltip;
  }

}

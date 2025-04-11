import {
  booleanAttribute,
  ComponentRef,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  ViewContainerRef
} from "@angular/core";
import { SCSkeletonComponent } from "../components/skeleton/skeleton.component";
import { SC_SKELETON_CUSTOM_CLASSES } from "../constants";

@Directive({
  selector: "[scSkeleton]",
  host: {
    class: "relative"
  }
})
export class SCSkeletonDirective {
  private readonly _vcr = inject(ViewContainerRef);
  private readonly _injector = inject(Injector);
  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Show or hide skeleton. When skeleton is hidden, the default content is shown */
  public readonly scSkeleton = input.required({ transform: booleanAttribute });
  /** Apply custom classes to the skeleton view */
  public readonly scSkeletonClass = input<string | null>(null);

  /** Instance to the currently shown skeleton component */
  private _component?: ComponentRef<SCSkeletonComponent>;

  constructor() {
    effect(() => {
      const show = this.scSkeleton();

      if (show) {
        this._renderSkeleton();
      } else {
        this._removeSkeleton();
      }
    });
  }

  /** Render the skeleton component */
  private _renderSkeleton() {
    if (this._component) {
      this._vcr.clear();
      this._component = undefined;
    }

    this._component = this._vcr.createComponent(SCSkeletonComponent, {
      injector: Injector.create({
        parent: this._injector,
        providers: [
          {
            provide: SC_SKELETON_CUSTOM_CLASSES,
            useValue: this.scSkeletonClass()
          }
        ]
      })
    });

    this._element.nativeElement.appendChild(this._component.location.nativeElement);
  }

  /** Remove the skeleton component */
  private _removeSkeleton() {
    if (this._component) {
      this._component.instance.leave().subscribe(() => {
        this._vcr.clear();
      });
      return;
    }

    this._vcr.clear();
  }
}

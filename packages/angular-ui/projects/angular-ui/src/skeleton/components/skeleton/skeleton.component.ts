import { AnimationEvent } from "@angular/animations";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { scSkeletonAnimation } from "../../animation";
import { SC_SKELETON_CUSTOM_CLASSES } from "../../constants";

@Component({
  selector: "sc-skeleton",
  templateUrl: "./skeleton.component.html",
  styleUrls: ["./skeleton.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scSkeletonAnimation.fadeOut],
  host: {
    class: "absolute top-0 left-0 w-full h-full",
    "[@skeletonState]": "_animationState()",
    "(@skeletonState.done)": "_handleAnimationEnd($event)"
  }
})
export class SCSkeletonComponent {
  public readonly customClasses = inject(SC_SKELETON_CUSTOM_CLASSES);

  private readonly _afterLeave = new Subject<void>();
  protected readonly _animationState = signal<"visible" | "hidden">("visible");

  protected _handleAnimationEnd(event: AnimationEvent): void {
    if (event.fromState === "visible" && (event.toState === "hidden" || event.toState === "void")) {
      this._afterLeave.next();
    }
  }

  public leave(): Observable<void> {
    this._animationState.set("hidden");
    return this._afterLeave.asObservable();
  }
}

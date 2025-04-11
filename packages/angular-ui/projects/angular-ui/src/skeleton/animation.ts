import { AnimationTriggerMetadata, animate, state, style, transition, trigger } from "@angular/animations";

export const scSkeletonAnimation: {
  readonly fadeOut: AnimationTriggerMetadata;
} = {
  /** Animation that shows and hides a snack bar. */
  fadeOut: trigger("skeletonState", [
    state(
      "void, hidden",
      style({
        opacity: 0
      })
    ),
    state(
      "visible",
      style({
        opacity: 1
      })
    ),
    transition(
      "* => void, * => hidden",
      animate(
        "75ms cubic-bezier(0.4, 0.0, 1, 1)",
        style({
          opacity: 0
        })
      )
    )
  ])
};

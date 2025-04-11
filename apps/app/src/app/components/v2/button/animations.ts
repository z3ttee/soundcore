import { AnimationTriggerMetadata, animate, state, style, transition, trigger } from "@angular/animations";
import { DEFAULT_ANIMATION_EASE } from "../constants";

export const scButtonAnimations: {
  readonly loaderToggle: AnimationTriggerMetadata;
  readonly btnTextSlide: AnimationTriggerMetadata;
} = {
  loaderToggle: trigger("loaderToggle", [
    transition(":enter", [
      style({
        opacity: 0
      }),
      animate(
        `75ms ${DEFAULT_ANIMATION_EASE}`,
        style({
          opacity: 1
        })
      )
    ]),
    transition(":leave", [
      animate(
        `75ms ${DEFAULT_ANIMATION_EASE}`,
        style({
          opacity: 0
        })
      )
    ])
  ]),
  btnTextSlide: trigger("btnTextSlide", [
    state(
      "hidden",
      style({
        opacity: 0
      })
    ),
    state(
      "visible, void",
      style({
        opacity: 1
      })
    ),
    transition("hidden <=> visible", [animate(`75ms ${DEFAULT_ANIMATION_EASE}`)])
  ])
};

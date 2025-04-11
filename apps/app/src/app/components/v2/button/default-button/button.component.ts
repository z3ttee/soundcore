import { NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  viewChild
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ScComponentAction } from "../../event";
import { ScLoader } from "../../loader";
import { scButtonAnimations } from "../animations";
import { ScButtonAlign, ScButtonColor, ScButtonSize, ScButtonVariant } from "../api/types";
import { ScBaseButtonComponent } from "../base-button/base-button.component";

@Component({
  standalone: true,
  selector: "sc-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [scButtonAnimations.loaderToggle, scButtonAnimations.btnTextSlide],
  imports: [NgClass, ScLoader, ScBaseButtonComponent]
})
export class ScButtonComponent {
  /**
   * Instance to the native button element.
   * @ignore
   */
  private readonly _nativeElement = viewChild.required(ScBaseButtonComponent);
  /**
   * DestroyRef to be notified
   * when the component gets destroyed
   * @ignore
   */
  private readonly _destroyRef = inject(DestroyRef);
  /**
   * Variant of the button
   * @default "contained"
   */
  public readonly variant = input<ScButtonVariant>("contained");
  /**
   * Color of the button
   */
  public readonly color = input<ScButtonColor>("default");
  /**
   * Alignment of the button content
   * @default "center"
   */
  public readonly alignment = input<ScButtonAlign>("center");
  /**
   * Size of the button
   * @default "md"
   */
  public readonly size = input<ScButtonSize>("md");
  /**
   * Whether the button is disabled
   * @default false
   */
  public readonly disabled = input<boolean>(false);
  /**
   * Click event of the button
   */
  public readonly onClick = output<ScComponentAction>({ alias: "click" });
  /**
   * Angular Signal that holds the
   * loading state
   * @default false
   * @ignore
   */
  protected readonly _isLoading = signal<boolean>(false);
  /**
   * Programmatically trigger the click event
   */
  public click(): void {
    this._nativeElement().click();
  }
  /**
   * Handle the button click event
   * @param event Event that was fired
   * @ignore
   */
  protected _handleClickEvent(event: Event): void {
    // Cancel native event
    event.preventDefault();
    event.stopPropagation();

    // Do nothing when button is disabled or loading
    if (this.disabled() || this._isLoading()) return;
    // Create action and subscribe
    const action = ScComponentAction.create(event as PointerEvent);
    action.$isRunning.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isRunning) => {
      this._isLoading.set(isRunning);
    });
    // Emit click event for parent components
    this.onClick.emit(action);
  }
}

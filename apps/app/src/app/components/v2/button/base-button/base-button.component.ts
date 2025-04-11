import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from "@angular/core";
import { ScButtonAlign, ScButtonColor, ScButtonVariant } from "../api/types";

@Component({
  standalone: true,
  selector: "sc-base-button",
  templateUrl: "./base-button.component.html",
  styleUrls: ["./base-button.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass]
})
export class ScBaseButtonComponent {
  /**
   * Instance to the native button element.
   * @ignore
   */
  private readonly _nativeElement = viewChild.required<ElementRef<HTMLButtonElement>>("nativeElement");
  /**
   * Variant of the button
   * @default "contained"
   */
  public readonly variant = input<ScButtonVariant>("contained");
  /**
   * Color of the button
   */
  public readonly color = input<ScButtonColor | null>(null);
  /**
   * Alignment of the button content
   * @default "center"
   */
  public readonly alignment = input<ScButtonAlign>("center");
  /**
   * Whether the button is disabled
   * @default false
   */
  public readonly disabled = input<boolean>(false);
  /**
   * Click event of the button
   */
  public readonly onClick = output<MouseEvent>({ alias: "click" });
  /**
   * Programmatically trigger the click event
   */
  public click(): void {
    this._nativeElement().nativeElement.click();
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

    this.onClick.emit(event as MouseEvent);
  }
}

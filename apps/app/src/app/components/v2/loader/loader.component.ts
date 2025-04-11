import { NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  signal,
  untracked,
  viewChild
} from "@angular/core";
import { isNull } from "@repo/utilities";

/**
 * Loader component that is used to display a loading indicator
 * for when the content needs time to load.
 * The component can be customized to spin faster, have different dimensions
 * and to switch between dark and light appearance
 */
@Component({
  standalone: true,
  selector: "sc-loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass]
})
export class ScLoaderComponent {
  /** Instance of the loader container */
  protected readonly element = viewChild<ElementRef<HTMLElement>>("spinner");

  /**
   * Width of the stroke.
   * Larger values make the stroke thicker,
   * while lower values make it thinner
   */
  public readonly strokeWidth = input<number>(3);

  /**
   * Size in px of the loader.
   * The value will be used for both
   * width and height.
   *
   * @example "Given 21 as size, the width would be 21px and the height 21px"
   * @default "Based on the fontsize of the text"
   */
  public readonly size = input<number>(this._getHeightBasedOnFontsize());

  /**
   * Speed multiplicator of the
   * spinner's animation.
   * Higher values let the spinner rotate faster,
   * while lower values make it slower
   */
  public readonly speed = input<number>(1);

  /** Set loader to active or inactive. Defaults to `true` */
  public readonly active = input<boolean>(true);

  protected readonly _calculatedSize = signal<number>(this.size());
  protected readonly _calculatedSpeed = computed<number>(() => 0.7 / (this.speed() || 1));
  protected readonly _calculateStrokeWidth = computed(() => {
    const width = this.strokeWidth();
    const size = this._calculatedSize();
    const maxWidth = size * 0.33;

    return Math.max(1, Math.min(width, maxWidth));
  });

  constructor() {
    effect(() => {
      const inputSize = this.size();
      untracked(() => {
        this._updateSize(inputSize);
      });
    });
  }

  /** Update size of the loader. If no size given, the size will be set to font size */
  private _updateSize(size?: number): void {
    this._calculatedSize.set(size || this._getHeightBasedOnFontsize());
  }

  /** Calculate height of loader based on current fontsize */
  private _getHeightBasedOnFontsize(): number {
    const nativeElement = this.element()?.nativeElement;
    if (isNull(window) || isNull(nativeElement)) return 16;

    // Get line height of text from component
    const lineHeight = parseInt(window.getComputedStyle(nativeElement).lineHeight);
    return (isNaN(lineHeight) ? 21 : lineHeight) - 5;
  }
}

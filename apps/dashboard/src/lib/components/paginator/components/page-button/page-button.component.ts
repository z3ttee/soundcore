import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

@Component({
  standalone: true,
  selector: "sc-page-button",
  templateUrl: "./page-button.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass]
})
export class ScPaginatorPageButtonComponent {
  public readonly active = input<boolean>(false);
  public readonly click = output<MouseEvent>();
}

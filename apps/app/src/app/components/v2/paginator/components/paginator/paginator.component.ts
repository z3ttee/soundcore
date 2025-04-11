import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  phosphorCaretDoubleLeft,
  phosphorCaretDoubleRight,
  phosphorCaretLeft,
  phosphorCaretRight
} from "@ng-icons/phosphor-icons/regular";
import { ScIconButton } from "../../../button";
import { ScPaginator } from "../../api/paginator";
import { ScPaginatorPageButtonComponent } from "../page-button/page-button.component";

@Component({
  standalone: true,
  selector: "sc-paginator",
  templateUrl: "./paginator.component.html",
  styleUrls: ["./paginator.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, NgTemplateOutlet, ScIconButton, ScPaginatorPageButtonComponent],
  providers: [
    {
      provide: ScPaginator,
      useExisting: ScPaginatorComponent
    },
    provideIcons({
      phosphorCaretLeft,
      phosphorCaretRight,
      phosphorCaretDoubleLeft,
      phosphorCaretDoubleRight
    })
  ]
})
export class ScPaginatorComponent extends ScPaginator {
  /**
   * Change the amount of pages displayed at once.
   * For example, when set to 3, the user is presented 3 buttons to
   * jump to a page at once.
   * If you want to have no page buttons, set this to <= 1.
   * @default 3
   */
  public readonly pages = input<number>(3);

  protected readonly start = computed(() => this.activePageIndex() * this.pageSize());
  protected readonly end = computed(() => Math.min(this.start() + this.pageSize(), this.length()));

  private readonly _pages = computed(() => Array.from({ length: this.maxPageIndex() + 1 }).map((_, index) => index));

  protected _displayablePageIndexes = computed(() => {
    const displayPageCount = this.pages();
    const allPages = [...this._pages()];

    const pivot = Math.floor(displayPageCount / 2);
    const start = Math.max(0, Math.min(this.activePageIndex() - pivot, allPages.length - displayPageCount));

    return allPages.splice(start, displayPageCount);
  });
}

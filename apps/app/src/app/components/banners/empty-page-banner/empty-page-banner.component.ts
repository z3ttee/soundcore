import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "scngx-empty-page-banner",
    templateUrl: "./empty-page-banner.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyPageBannerComponent {

    @Input() 
    public title?: string;

    @Input() 
    public message?: string;
  
    public options = {
      path: "assets/animated/empty.json",
      autoplay: true,
      loop: true
    }

}
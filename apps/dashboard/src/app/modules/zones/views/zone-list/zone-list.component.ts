import { ApiZonesService } from "@/sdk/zones";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { Pageable } from "@repo/utilities";

@Component({
    selector: "app-zone-list-view",
    templateUrl: "./zone-list.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneListViewComponent implements OnInit {
    private readonly _service = inject(ApiZonesService);


    ngOnInit(): void {
        this._service.getZones(new Pageable(0, 10)).subscribe((future) => {
            console.log(future);
        })
    }
}
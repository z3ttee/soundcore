import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Zone } from "@repo/angular-sdk";
import { Page, Pageable, toFuture } from "@repo/utilities";

@Injectable({ providedIn: 'root' })
export class ApiZoneService {
    private readonly _http = inject(HttpClient);

    public findZones(pageable: Pageable) {
        return this._http.get<Page<Zone>>(`/api/v1/zones${pageable.toQuery()}`).pipe(toFuture());
    }
}

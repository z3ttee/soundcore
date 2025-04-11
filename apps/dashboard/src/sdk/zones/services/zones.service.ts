import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Future, Page, Pageable, toFuture } from "@repo/utilities";
import { Observable } from "rxjs";
import { Zone } from "../entities/zone";

@Injectable({ providedIn: "root" })
export class ApiZonesService {
    private readonly _http = inject(HttpClient);

    public getZones(pageable: Pageable): Observable<Future<Page<Zone>>> {
        return this._http.get<Page<Zone>>(`/api/v1/zones${pageable.toQuery()}`).pipe(toFuture());
    }
}
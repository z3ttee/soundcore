import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class ScrollService {

    private _bottomScrolledSubject: BehaviorSubject<void> = new BehaviorSubject(null);

    public $onBottomReached: Observable<void> = this._bottomScrolledSubject.asObservable();

    public async emitOnBottomReached() {
        console.log("bottom reached")
        this._bottomScrolledSubject.next()
    }

}
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class SongService {

    constructor(private httpClient: HttpClient) {}

}
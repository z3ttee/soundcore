import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { SCDKOptions, SCDK_OPTIONS } from "../../scdk.module";
import { SCDKPlaylistService } from "../../playlist/services/playlist.service";

@Injectable()
export class SCDKLibraryService {

    constructor(
        private readonly httpClient: HttpClient,
        private readonly playlistService: SCDKPlaylistService,
        @Inject(SCDK_OPTIONS) private readonly options: SCDKOptions
    ) {}

    

}
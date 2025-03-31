import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Future, isNull, toFuture } from '@repo/utilities';
import { filter, map, Observable, of } from 'rxjs';
import { SCSDK_OPTIONS } from '../../constants';
import type { SCSDKOptions } from '../../scdk.module';
import { StreamToken } from '../entities/token.entity';

@Injectable()
export class SCSDKStreamService {

    constructor(
        private readonly httpClient: HttpClient,
        @Inject(SCSDK_OPTIONS) private readonly options: SCSDKOptions
    ) { }

    /**
     * Create the stream url for a song id. This will automatically request
     * a token to track what the user has listened to in the database
     * @param songId Id of the song
     * @returns Stream url for the song
     */
    public requestStreamUrl(songId: string, withToken: boolean = true): Observable<string | null> {
        if (!withToken) return of(`${this.options.api_base_uri}/v1/streams/stream`);

        return this.requestToken(songId).pipe(
            filter((request) => !request.loading),
            map((request) => {
                if (request.error) throw request.error;
                if (isNull(request.data?.token)) return null;
                return `${this.options.api_base_uri}/v1/streams/stream?token=${request.data?.token}`;
            })
        );
    }

    /**
     * Request just a stream token from the api to track user's listening
     * behaviour.
     * @param songId Id of the song to create token for
     * @returns Streamtoken
     */
    public requestToken(songId: string): Observable<Future<StreamToken>> {
        return this.httpClient.get<StreamToken>(`${this.options.api_base_uri}/v1/streams/token/${songId}`).pipe(toFuture());
    }

}

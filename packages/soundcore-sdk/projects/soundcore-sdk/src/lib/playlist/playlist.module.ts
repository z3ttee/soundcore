import { NgModule } from '@angular/core';
import { SCSDKPlaylistService } from './services/playlist.service';
import { BehaviorSubject } from 'rxjs';
import { Playlist } from './entities/playlist.entity';
import { HttpClient } from '@angular/common/http';
import { SCSDK_OPTIONS } from '../constants';
import { SCSDKOptions } from '../scdk.module';

const librarySubject: BehaviorSubject<Playlist[]> = new BehaviorSubject([]);

@NgModule({
    providers: [
        // SCSDKPlaylistService,
        {
            provide: SCSDKPlaylistService,
            deps: [HttpClient, SCSDK_OPTIONS],
            useFactory: (httpClient: HttpClient, options: SCSDKOptions) => {
                return new SCSDKPlaylistService(librarySubject, httpClient, options)
            }
        }
    ]
})
export class SCSDKPlaylistModule { }

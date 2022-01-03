import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { environment } from 'src/environments/environment';

import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { Song } from 'src/app/model/song.model';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private _queueSubject: BehaviorSubject<Song[]> = new BehaviorSubject([]);

  public $queue: Observable<Song[]> = this._queueSubject.asObservable();

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) { }

  public async findMyUploadedSongs(pageable: Pageable): Promise<Page<any>> {
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/index/byUploader/@me${Pageable.toQuery(pageable)}`)).catch((reason) => {
      // TODO: Handle error correctly
      console.error(reason);
      return Page.of([]) as Page<any>;
    }).then((page) => page as Page<any>)
  }

  public async findProcessingUploads(): Promise<Page<any>> {
    return null;
  }

  public async abortUpload() {
    // TODO
  }

  
}

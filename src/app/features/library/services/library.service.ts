import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { environment } from 'src/environments/environment';

import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { Upload } from '../entities/upload.entity';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private _queueSubject: BehaviorSubject<Upload[]> = new BehaviorSubject([]);

  public $queue: Observable<Upload[]> = this._queueSubject.asObservable();

  constructor(private httpClient: HttpClient, private authService: AuthenticationService) { }

  public async findMyUploads(pageable: Pageable): Promise<Page<any>> {
    // TODO: Remove auth header and put into request interceptor
    return firstValueFrom(this.httpClient.get(`${environment.api_base_uri}/v1/uploads/byUploader/@me${Pageable.toQuery(pageable)}`, {
      headers: {
        "Authorization": "Bearer " + this.authService.getSession().accessToken
      }
    })).catch((reason) => {
      // TODO: Handle error correctly
      console.error(reason);
      return Page.of([]) as Page<any>;
    }).then((page) => page as Page<any>)
  }

  public async findProcessingUploads(): Promise<Page<any>> {
    return null;
  }

  public async enqueueFile(file: File) {
    const upload: Upload = new Upload(file, this.httpClient, this.authService);

    this._queueSubject.next([
      ...this._queueSubject.getValue(),
      upload
    ])
    console.log(upload)
    upload.start()

    // upload.fileType = FileType.FILE_SONG
    // upload.
  }

  public async abortUpload() {
    // TODO
  }

  
}

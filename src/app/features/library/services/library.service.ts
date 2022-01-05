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

  constructor(private httpClient: HttpClient) { }

}

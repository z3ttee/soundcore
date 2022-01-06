import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable } from 'rxjs';
import { SongService } from 'src/app/features/song/services/song.service';
import { Page, Pageable } from 'src/app/pagination/pagination';

@Component({
  selector: 'asc-library-uploads',
  templateUrl: './library-uploads.component.html',
  styleUrls: ['./library-uploads.component.scss']
})
export class LibraryUploadsComponent implements OnInit {

  public pageSizeOptions: number[] = [25, 50, 100];

  public selectedPageSize: number = 25;
  public currentPageIndex: number = 0;

  public isLoading: boolean = true;

  private _uploadsPageSubject: BehaviorSubject<any> = new BehaviorSubject(Page.of([]));
  public $uploadsPage: Observable<Page<any>> = this._uploadsPageSubject.asObservable();

  constructor(
    private songService: SongService
  ) { }

  ngOnInit(): void {
    this.findMyUploads()
  }

  private async findMyUploads(pageable: Pageable = { page: this.currentPageIndex, size: this.selectedPageSize }) {
    this.isLoading = true;
    this.songService.findMyUploadedSongs(pageable).then((page) => {
      if(!page) page = Page.of([]);
      this._uploadsPageSubject.next(page)
    }).finally(() => {
      this.isLoading = false;
    })
  }

  public onPageEvent(event: PageEvent): void {
    this.selectedPageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;

    this.findMyUploads()
  }

  public createUpload(): void {
    
  }

}

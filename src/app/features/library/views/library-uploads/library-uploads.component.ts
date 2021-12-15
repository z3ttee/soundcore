import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable } from 'rxjs';
import { Page, Pageable } from 'src/app/pagination/pagination';
import { LibraryService } from '../../services/library.service';

@Component({
  selector: 'asc-library-uploads',
  templateUrl: './library-uploads.component.html',
  styleUrls: ['./library-uploads.component.scss']
})
export class LibraryUploadsComponent implements OnInit {

  public pageSizeOptions: number[] = [5, 10, 25, 30];

  public selectedPageSize: number = 10;
  public currentPageIndex: number = 0;

  public isLoading: boolean = true;

  private _uploadsPageSubject: BehaviorSubject<any> = new BehaviorSubject(Page.of([]));
  public $uploadsPage: Observable<Page<any>> = this._uploadsPageSubject.asObservable();

  constructor(private libraryService: LibraryService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.findMyUploads()
  }

  private async findMyUploads(pageable: Pageable = { page: this.currentPageIndex, size: this.selectedPageSize }) {
    this.isLoading = true;
    this.libraryService.findMyUploads(pageable).then((page) => {
      if(!page) page = Page.of([]);
      console.log(page)
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

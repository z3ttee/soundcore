import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Song } from 'src/app/features/song/entities/song.entity';
import { SongService } from 'src/app/features/song/services/song.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { Album } from '../../entities/album.entity';
import { AlbumService } from '../../services/album.service';

@Component({
  templateUrl: './album-info.component.html',
  styleUrls: ['./album-info.component.scss']
})
export class AlbumInfoComponent implements OnInit, OnDestroy {

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  // Loading states
  public isLoading: boolean = false;
  public isLoadingSongs: boolean = false;

  // Main data objects
  private _songsSubject: BehaviorSubject<Song[]> = new BehaviorSubject([])
  public $songs: Observable<Song[]> = this._songsSubject.asObservable();

  public albumId: string;
  public album: Album;
  public recommendedAlbums: Album[] = [];
  
  // Artworks
  public coverSrc: string = null;
  public bannerSrc: string = null;

  // Accent colors  
  public accentColor: string = "#FFBF50";

  // Pagination
  public totalElements: number = 0;
  private currentPage: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private albumService: AlbumService,
    private songService: SongService,
    private router: Router,
    private scrollService: ScrollService
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.albumId = paramMap.get("albumId");

      this.isLoading = true;
      this.albumService.findById(this.albumId).then((album) => {
        this.album = album;

        this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
          this.findSongs()
        })

        this.albumService.findRecommendedByArtist(this.album?.artist?.id, [ this.album?.id ]).then((page) => {
          this.recommendedAlbums = page.elements;
        })
      }).finally(() => this.isLoading = false)
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async showDiscography() {
    if(!this.album?.artist) return;
    this.router.navigate(["/artist", this.album.artist?.id, "discography"])
  }

  public async findSongs() {
    const currentItemCount = this._songsSubject.getValue().length;
    if(currentItemCount != 0 && currentItemCount >= this.totalElements) return;

    this.isLoadingSongs = true;
    this.songService.findByAlbum(this.albumId, { page: this.currentPage }).then((page) => {
      this.totalElements = page.totalElements;
      if(page.elements.length > 0) this.currentPage++;
      
      this._songsSubject.next([
        ...this._songsSubject.getValue(),
        ...page.elements
      ])
    }).finally(() => {
      this.isLoadingSongs = false;
    })
  }

}

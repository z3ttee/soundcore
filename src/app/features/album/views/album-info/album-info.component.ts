import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Song } from 'src/app/features/song/entities/song.entity';
import { SongService } from 'src/app/features/song/services/song.service';
import { Album } from '../../entities/album.entity';
import { AlbumService } from '../../services/album.service';

@Component({
  templateUrl: './album-info.component.html',
  styleUrls: ['./album-info.component.scss']
})
export class AlbumInfoComponent implements OnInit {

  // Loading states
  public isLoading: boolean = false;

  // Main data objects
  public album: Album;
  public songs: Song[] = [];
  public recommendedAlbums: Album[] = [];
  
  // Artworks
  public coverSrc: string = null;
  public bannerSrc: string = null;

  // Accent colors  
  public accentColor: string = "#FFBF50";

  constructor(
    private activatedRoute: ActivatedRoute,
    private albumService: AlbumService,
    private songService: SongService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      const albumId = paramMap.get("albumId");
      if(!albumId) {
        this.album = null;
        return;
      }

      this.isLoading = true;
      this.albumService.findById(albumId).then((album) => {
        this.album = album;

        this.songService.findByAlbum(albumId).then((page) => {
          this.songs = page.elements;
          console.log(this.songs)
        })

        this.albumService.findRecommendedProfilesByArtist(this.album?.artist?.id, [ this.album?.id ]).then((page) => {
          this.recommendedAlbums = page.elements;
          console.log(this.recommendedAlbums)
        })
      }).finally(() => this.isLoading = false)
    })
  }

  public async showDiscography() {
    if(!this.album?.artist) return;
    this.router.navigate(["/artist", this.album.artist?.id, "discography"])
  }

}

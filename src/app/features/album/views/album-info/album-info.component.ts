import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Song } from 'src/app/features/song/entities/song.entity';
import { SongService } from 'src/app/features/song/services/song.service';
import { environment } from 'src/environments/environment';
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
  public songs: Song[];
  
  // Artworks
  public coverSrc: string = null;
  public bannerSrc: string = null;

  // Accent colors  
  public accentColor: string = "";
  public bannerAccentColor: string = "";

  constructor(
    private activatedRoute: ActivatedRoute,
    private albumService: AlbumService,
    private songService: SongService
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

        if(this.album?.artwork) {
          this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.album.artwork.id}`;
          this.accentColor = this.album.artwork.accentColor;
        } else {
          this.coverSrc = "/assets/img/missing_cover.png"
        }

        if(this.album?.banner) {
          this.bannerSrc = `${environment.api_base_uri}/v1/artworks/${this.album.banner.id}`;
          this.bannerAccentColor = this.album.banner.accentColor;
        } else {
          this.bannerSrc = null
        }

        // TODO: Use songservice to fetch songs of album
        this.songService.findByAlbum(albumId).then((page) => {
          this.songs = page.elements;
          console.log(this.songs)
        })
      }).finally(() => this.isLoading = false)
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Song } from 'src/app/features/song/entities/song.entity';
import { Artist } from 'src/app/model/artist.model';
import { environment } from 'src/environments/environment';
import { ArtistService } from '../../services/artist.service';

@Component({
  selector: 'asc-artist-info',
  templateUrl: './artist-info.component.html',
  styleUrls: ['./artist-info.component.scss']
})
export class ArtistInfoComponent implements OnInit {

  public artist: Artist;
  public isLoading: boolean = false;

  public coverSrc: string = null;
  public accentColor: string = "";

  public bannerSrc: string = null;
  public bannerAccentColor: string = "";

  public topSongs: Song[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private artistService: ArtistService
  ) { }

  public ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      const artistId = paramMap.get("artistId");
      if(!artistId) {
        this.artist = null;
        return;
      }

      this.isLoading = true;
      this.artistService.findProfileById(artistId).then((artist) => {
        this.artist = artist;

        if(this.artist?.artwork) {
          this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.artist.artwork.id}`;
          this.accentColor = this.artist.artwork.accentColor;
        } else {
          this.coverSrc = "/assets/img/missing_cover.png"
        }

        if(this.artist?.banner) {
          this.bannerSrc = `${environment.api_base_uri}/v1/artworks/${this.artist.banner.id}`;
          this.bannerAccentColor = this.artist.banner.accentColor;
        } else {
          this.bannerSrc = null
        }

        this.artistService.findTopSongsByArtist(artistId).then((songs) => {
          this.topSongs = songs
        })
      }).finally(() => this.isLoading = false)
    })
  }

}

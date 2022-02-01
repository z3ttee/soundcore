import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Song } from 'src/app/features/song/entities/song.entity';
import { Artist } from 'src/app/features/artist/entities/artist.entity';
import { ArtistService } from '../../services/artist.service';
import { Album } from 'src/app/features/album/entities/album.entity';
import { Playlist } from 'src/app/features/playlist/entities/playlist.entity';
import { Genre } from 'src/app/model/genre.entity';
import { Page } from 'src/app/pagination/pagination';

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
  public genres: Page<Genre> = null;
  public songs: Song[] = [];
  public albums: Album[] = [];
  public featAlbums: Album[] = [];
  public featPlaylists: Playlist[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private artistService: ArtistService,
    public router: Router
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

        this.artistService.findTopSongsByArtist(artistId).then((songs) => {
          this.topSongs = songs
        })

        this.artistService.findGenresByArtist(artistId, { size: 12, page: 0 }).then((page) => {
          this.genres = page;
        })

        this.artistService.findSongsByArtist(artistId, { size: 12, page: 0 }).then((page) => {
          this.songs = page.elements;
        })

        this.artistService.findAlbumsByArtist(artistId, { size: 12, page: 0}).then((page) => {
          this.albums = page.elements;
        })

        this.artistService.findFeaturedAlbumsWithArtist(artistId, { size: 12, page: 0 }).then((page) => {
          this.featAlbums = page.elements;
        })
      }).finally(() => this.isLoading = false)
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AuthenticationService } from 'src/app/sso/authentication.service';
import { Collection } from '../../entities/collection.entity';
import { CollectionService } from '../../services/collection.service';

@Component({
  templateUrl: './collection-info.component.html',
  styleUrls: ['./collection-info.component.scss']
})
export class CollectionInfoComponent implements OnInit {

  public collection: Collection;
  public songs: Song[] = [] // TODO: Implement infinite scroll

  public isLoading: boolean = false;

  // Accent colors  
  public accentColor: string = "#FFBF50";

  constructor(
    private collectionService: CollectionService,
    public authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.collectionService.findCollection().then((collection) => {
      console.log(collection)
      this.collection = collection;

      this.collectionService.findSongsByCollection().then((page) => {
        console.log(page)
        this.songs.push(...page.elements)
      })
    }).finally(() => {
      this.isLoading = false
    })
  }

}

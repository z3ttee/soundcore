import { Component, Input, OnInit } from '@angular/core';
import { Genre } from 'src/app/model/genre.entity';

@Component({
  selector: 'asc-genre-grid-item',
  templateUrl: './genre-grid-item.component.html',
  styleUrls: ['./genre-grid-item.component.scss']
})
export class GenreGridItemComponent implements OnInit {

  @Input() public genre: Genre;

  constructor() { }

  public ngOnInit(): void {
    
  }

}

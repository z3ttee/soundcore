import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  templateUrl: './library-index.component.html',
  styleUrls: ['./library-index.component.scss']
})
export class LibraryIndexComponent implements OnInit {

  public activeLinkIndex: number = -1;
  public navLinks: any[];

  constructor(private router: Router) {
    this.navLinks = [
        {
            label: 'Deine Playlists',
            link: '/library',
            index: 0
        }, 
        {
            label: 'Deine Uploads',
            link: '/library/uploads',
            index: 1
        }
    ];
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd)).subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });
  }

}

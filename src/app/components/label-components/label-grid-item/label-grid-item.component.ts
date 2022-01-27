import { Component, Input, OnInit } from '@angular/core';
import { Distributor } from 'src/app/model/distributor.entity';
import { Label } from 'src/app/model/label.model';
import { Publisher } from 'src/app/model/publisher.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'asc-label-grid-item',
  templateUrl: './label-grid-item.component.html',
  styleUrls: ['./label-grid-item.component.scss']
})
export class LabelGridItemComponent implements OnInit {

  @Input() public label: Label | Publisher | Distributor;
  @Input() public type: "label" | "publisher" | "distributor" = "label";

  public coverSrc: string = null;
  public accentColor: string = "";

  public typeText: string = this.type == "label" ? "Label" : "Herausgeber"

  constructor() { }

  ngOnInit(): void {
    if(this.label.artwork) {
        this.coverSrc = `${environment.api_base_uri}/v1/artworks/${this.label.artwork.id}`;
        this.accentColor = this.label.artwork.accentColor || "#000000";
    } else {
        this.coverSrc = "/assets/img/missing_cover.png"
    }
  }

}

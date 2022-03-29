import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'asc-volume-slider',
  templateUrl: './volume-slider.component.html',
  styleUrls: ['./volume-slider.component.scss']
})
export class AscVolumeSliderComponent implements OnInit, AfterViewInit {

  @ViewChild("slider") public slider: ElementRef<HTMLInputElement>;

  private _volume: number;
  @Input() public set volume(val: number) { 
    this._volume = val * 100; 
    this.updateTrack();
  }
  public get volume(): number { 
    return this._volume; 
  }

  @Output() public onVolume: EventEmitter<number> = new EventEmitter();

  constructor() { }

  public ngOnInit(): void {}
  public onInputChanged(event: Event) {
    // Needs to be divided by 100 because we previously multiply inputted value by 100 for 
    // smoother sliding
    const volume = parseInt(event.currentTarget["value"]) / 100;
    this.updateTrack();
    this.onVolume.emit(volume);
  }
  public ngAfterViewInit(): void {
    this.updateTrack();
  }

  public updateTrack() {
    if(!this.slider?.nativeElement) return;

    const max = parseInt(this.slider.nativeElement.max);
    const val = parseInt(this.slider.nativeElement.value);
    let progress = (val/max * 100 )

    // This is done so the track doesnt lag behind the thumb
    if(progress != 0) {
      if(progress <= 40) progress += 0.25;
    }
    
    this.slider.nativeElement.style.backgroundSize = progress + '% 100%';
  }

}

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";

@Component({
    selector: 'scngx-seeker',
    templateUrl: './seeker.component.html',
    styleUrls: ['./seeker.component.scss']
})
export class SCNGXSeekerComponent implements OnInit {
  
    @ViewChild("inputElement") public range: ElementRef<HTMLInputElement>;

    @Input() public size: "default" | "large" = "default";
  
    private _duration: number = 0;
    @Input() public set duration(val: number){
      this._duration = val*1000;
    }
  
    public get duration(): number {
      return this._duration;
    }
  
    @Input() public set current(val: number) {
      if(this.isInputting) return;
      this.value = val*1000;
      this.updateProgress();
    }
  
    @Output() 
    public seek: EventEmitter<number> = new EventEmitter();
  
    public get current(): number { return this.value }
  
    public value: number = 0;
    private isInputting: boolean = false;
  
    constructor() { }
  
    ngOnInit(): void {
        this.value = this.current;
        this.updateProgress();
    }
  
    public onInputChanged(event: Event) {
        this.isInputting = false;
        this.seek.emit(parseInt(event.target["value"]) / 1000);
    }
  
    public onInput() {
        this.isInputting = true;
        this.updateProgress(true);
    }
  
    public updateProgress(useValue: boolean = false) {
        if(!this.range?.nativeElement) return;

        const max = this.duration;
        const val = useValue ? parseInt(this.range.nativeElement.value) : this.current;

        let progress = (val/max * 100 );
        
        this.range.nativeElement.style.backgroundSize = progress + '% 100%';
    }
  
  
}
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";

@Component({
    selector: 'scngx-range',
    templateUrl: './range.component.html',
    styleUrls: ['./range.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXRangeComponent implements OnInit, AfterViewInit {
  
    @ViewChild("inputElement") public range: ElementRef<HTMLInputElement>;
  
    private _max: number = 100;
    @Input() public set max(val: number){
      this._max = val;
    }
  
    public get max(): number {
      return this._max;
    }
  
    @Input() public set current(val: number) {
      this.value = val;
      this.updateProgress();
    }
  
    @Output() 
    public onChanged: EventEmitter<number> = new EventEmitter();
  
    public get current(): number { return this.value }
  
    public value: number = 0;
  
    constructor() { }
  
    ngOnInit(): void {
        this.value = this.current;
    }

    ngAfterViewInit(): void {
        this.updateProgress();
    }
  
    public onInputChanged(event: Event) {
        this.onChanged.emit(parseInt(event.target["value"]));
        this.updateProgress(true);
    }
  
    public updateProgress(useValue: boolean = false) {
        if(!this.range?.nativeElement) return;

        const max = this.max;
        const val = useValue ? parseInt(this.range.nativeElement.value) : this.current;

        let progress = (val/max * 100 );
        this.range.nativeElement.style.backgroundSize = progress + '% 100%';
    }
  
  
}
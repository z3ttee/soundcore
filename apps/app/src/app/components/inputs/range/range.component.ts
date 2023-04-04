import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'scngx-range',
    templateUrl: './range.component.html',
    styleUrls: ['./range.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXRangeComponent implements AfterViewInit {
  
    @ViewChild("inputElement") public range: ElementRef<HTMLInputElement>;

    public readonly $value: BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly $max: BehaviorSubject<number> = new BehaviorSubject(100);
  
    @Input() public set max(val: number){
      this.$max.next(val);
      this.updateProgress();
    }

    @Input() public set current(val: number) {
      this.$value.next(val);
      this.updateProgress();
    }
  
    @Output() 
    public onChanged: EventEmitter<number> = new EventEmitter();  

    ngAfterViewInit(): void {
      this.updateProgress();
    }
  
    public onInputChanged(event: Event) {
      this.onChanged.emit(parseInt(event.target["value"]));
      this.updateProgress(true);
    }
  
    public updateProgress(useValue: boolean = false) {
      if(!this.range?.nativeElement) return;

      const max = this.$max.getValue();
      const val = useValue ? parseInt(this.range.nativeElement.value) : this.$value.getValue();

      let progress = (val/max * 100 );
      this.range.nativeElement.style.backgroundSize = progress + '% 100%';
    }
  
}
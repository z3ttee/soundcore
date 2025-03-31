import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, forwardRef, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from "uuid";

export const CUSTOM_TEXT_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SCNGXTextInputComponent),
  multi: true
};

@Component({
  selector: 'scngx-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ CUSTOM_TEXT_INPUT_CONTROL_VALUE_ACCESSOR ],
  host: {
    '(blur)': 'onTouched()'
  },
  animations:[
    trigger(
      'visibilityChanged',[
            state('true',style({'height':'*','padding-top':'4px'})),
            state('false',style({height:'0px','padding-top':'0px'})),
            transition('*=>*',animate('200ms'))
      ]
    )
  ]
})
export class SCNGXTextInputComponent implements OnInit, OnDestroy, ControlValueAccessor, OnChanges {

  private readonly _destroy: Subject<void> = new Subject();

  public readonly id: string = uuidv4();

  @Input() public type: "text" | "password" = "text";
  @Input() public placeholder: string = "";

  /**
   * Define the amount of lines of the text field.
   * If more than 1, the field will be transformed
   * to a textarea element instead.
   */
  @Input() public lines: number = 1;

  /**
   * Define if the input is required.
   * This shows an indicator to the user
   * and applies validation rules.
   */
  @Input() public required?: boolean = false;

  @Input() public formControl: FormControl<any> = new FormControl();

  @ViewChild('input') inputRef: ElementRef<HTMLInputElement>;

  // Place where all errors of formControl will be stored.
  public errors: any[] = []; 

  // Manage inner value of the input element
  private innerValue: any = '';

  // Propagate changes into the custom form control.
  // Will be registered by the ControlValueAccessor interface
  public propagateChange = (_: any) => { }
  public onTouched = (_: any) => { }


  constructor() {}

  public ngOnInit(): void {}
  public ngOnChanges(): void {}
  public ngAfterViewInit(): void { 
      // RESET the custom input form control UI when the form control is RESET
      this.formControl.valueChanges.subscribe(() => {
        // check condition if the form control is RESET
        if (this.formControl.value == "" || this.formControl.value == null || this.formControl.value == undefined) {
          this.innerValue = "";      
          this.inputRef.nativeElement.value = "";                 
        }
      });
  }

  public ngOnDestroy(): void {
      this._destroy.next();
      this._destroy.complete();
  }

  public onChange(event: Event, value: any){

      //set changed value
      this.innerValue = value;

      // propagate value into form control using control value accessor interface
      this.propagateChange(this.innerValue);

      console.log("onChange(): ", this.innerValue);

      //reset errors 
      this.errors = [];

      //setting, resetting error messages into an array (to loop) and adding the validation messages to show below the field area
      for (var key in this.formControl.errors) {
          if (this.formControl.errors.hasOwnProperty(key)) {
              if(key === "required"){
                  this.errors.push("This field is required");
              }else{
                  this.errors.push(this.formControl.errors[key]);
              }              
          }
      }
  }

  public writeValue(value: any): void {
    this.innerValue = value;
  }
  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  public setDisabledState?(isDisabled: boolean): void {}

}

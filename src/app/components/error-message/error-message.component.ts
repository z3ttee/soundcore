import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AllianceError } from 'src/app/model/error.model';

@Component({
  selector: 'asc-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {

  private _error: HttpErrorResponse;

  public isValidationError: boolean = false;
  public stringMessage: string = "";
  public messages: {key: string, messages: string[]}[] = [];

  @Input() public withIcon: boolean = true;

  @Input() public set error(error: HttpErrorResponse) {
    this._error = error;
    this.processError();
  }

  public get error(): HttpErrorResponse {
    return this._error;
  }

  constructor() { }

  public ngOnInit(): void {
    this.processError();
  }

  private processError() {
    if(!this.error) return;

    // Reset current error
    this.stringMessage = "";
    this.messages = [];

    const err: AllianceError = this.error.error;

    if(typeof err.message == "string") {
      this.isValidationError = false;
      this.stringMessage = err.message;
    } else{
      this.isValidationError = true;
      
      for(const key in err.message) {
        this.messages.push({
          key,
          messages: err.message[key]
        });
      }
    }
  }

}

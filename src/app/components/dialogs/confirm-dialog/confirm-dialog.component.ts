import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  okBtnText?: string;
  cancelBtnText?: string;
}

@Component({
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class AscConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AscConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogOptions = {}
  ) { }

}

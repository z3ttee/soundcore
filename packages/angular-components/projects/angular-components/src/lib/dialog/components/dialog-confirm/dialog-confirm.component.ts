import { Component, OnInit } from '@angular/core';
import { DialogRef } from '../../entities/dialog-ref.entity';

@Component({
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent implements OnInit {

  constructor(
    public readonly dialogRef: DialogRef
  ) { }

  ngOnInit(): void {}

  public confirm() {
    this.dialogRef.close(true);
  }

}

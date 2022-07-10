import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogRef } from '../../entities/dialog-ref.entity';
import { SCNGXDialogService } from '../../services/dialog.service';

@Component({
  selector: 'scngx-dialog',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class SCNGXDialogComponent implements OnInit, OnDestroy {

  constructor(
    private readonly dialogRef: DialogRef
  ) { }

  @Output() public onDismiss: EventEmitter<void> = new EventEmitter();

  ngOnInit(): void {
    console.log(this.dialogRef.id);
  }
  ngOnDestroy(): void {
    console.log("destroyed test dialog")
  }

  public close(result?: any) {
    this.dialogRef.close(result);
  }

}

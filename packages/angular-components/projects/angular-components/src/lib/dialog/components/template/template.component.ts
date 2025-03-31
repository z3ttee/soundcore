import { Component, Input, OnInit } from '@angular/core';
import { DialogRef } from '../../entities/dialog-ref.entity';

@Component({
  selector: 'scngx-dialog',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class SCNGXDialogComponent implements OnInit {

  @Input() public title: string;

  constructor(
    private readonly dialogRef: DialogRef
  ) { }

  public showClose: boolean = false;

  public ngOnInit(): void {
    // Fix: NgHeroIcon throwing error saying
    // nativeElement is undefined.
    this.showClose = true;
  }

  public close(result?: any) {
    this.dialogRef.close(result);
  }

}

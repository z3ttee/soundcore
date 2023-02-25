import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Task } from '@soundcore/sdk';

@Component({
  selector: 'scngx-task-list-item',
  templateUrl: './task-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXTaskListItemComponent {

  @Input() 
  public task: Task;

  @Input()
  public itemHeight: number = 56;
  
}

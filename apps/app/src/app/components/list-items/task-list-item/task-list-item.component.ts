import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Task } from '@soundcore/sdk';

@Component({
  selector: 'scngx-task-list-item',
  templateUrl: './task-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SCNGXTaskListItemComponent {

  @Input() 
  public task?: Task;

  @Input()
  public itemHeight: number = 56;

  // public getCurrentStageNr() {
  //   return this.task?.stages?.findIndex((stage) => stage.id === this.task?.currentStageId) + 1;
  // }

  public getDuration(): string {
    if(!this.task?.createdAt || !this.task?.updatedAt) return "---";
    const startedAt = new Date(this.task?.createdAt);
    const endedAt = new Date(this.task?.updatedAt);
    const diffMs = endedAt.getTime() - startedAt.getTime();

    if(diffMs < 0) return "---";

    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

    let outputs = "";
    if(hours > 0) outputs += `${hours}h `;
    if(minutes > 0) outputs += `${minutes}m `;
    if(seconds >= 0) outputs += `${seconds}s`;

    return outputs;
  }
  
}

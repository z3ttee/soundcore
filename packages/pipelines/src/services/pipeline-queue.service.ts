import { Injectable } from "@nestjs/common";
import { PipelineRun } from "../entities/pipeline.entity";
import { PipelineEventService } from "./pipeline-event.service";

@Injectable()
export class PipelineQueue {

    private readonly queue: PipelineRun[] = [];

    constructor(
        private readonly events: PipelineEventService
    ) {}
    
    public enqueue(run: PipelineRun): number {
        const position = this.queue.push(run);
        this.events.fireEvent("enqueued", position, { pipeline: run });
        return position;
    }

    public dequeue(): PipelineRun {
        const next = this.queue.shift();
        this.events.fireEvent("dequeued", { pipeline: next });
        return next;
    }

    public removeById(runId: string): PipelineRun {
        const index = this.queue.findIndex((p) => p.runId === runId);
        if(index == -1) return null;

        return this.queue.splice(index, 1)?.[0];
    }

    public peek(): PipelineRun {
        return this.queue[0];
    }

    public get isEmpty(): boolean {
        return this.queue.length <= 0;
    }

    public get size(): number {
        return this.queue.length;
    }
}
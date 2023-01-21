import { Pipeline } from "./pipeline.entity";

export class PipelineQueue {

    private readonly pipelines: Pipeline[] = [];

    public enqueue(pipeline: Pipeline): number {
        return this.pipelines.push(pipeline);
    }

    public dequeue(): Pipeline {
        return this.pipelines.splice(0, 1)?.[0];
    }

    public peek(): Pipeline {
        return this.pipelines[0];
    }

    public isEmpty(): boolean {
        return this.size <= 0;
    }

    public get size(): number {
        return this.pipelines.length;
    }

}
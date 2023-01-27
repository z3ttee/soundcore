import { PipelineRun, PipelineWithScript } from "./pipeline.entity";

export class PipelineQueue {

    private readonly pipelines: PipelineRun[] = [];

    public enqueue(pipeline: PipelineWithScript | PipelineRun): number {
        if(pipeline["runId"]) return this.pipelines.push(pipeline as PipelineRun);
        const run = new PipelineRun(pipeline.script, pipeline.options, pipeline.id, pipeline.name, pipeline.stages, pipeline.environment);
        return this.pipelines.push(run);
    }

    public dequeue(): PipelineRun {
        return this.pipelines.splice(0, 1)?.[0];
    }

    public peek(): PipelineRun {
        return this.pipelines[0];
    }

    public isEmpty(): boolean {
        return this.size <= 0;
    }

    public get size(): number {
        return this.pipelines.length;
    }

}
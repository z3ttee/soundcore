import { StageConfigurator } from "./stage.builder";

export class PipelineConfigurator {
    private _maxConcurrentStages: number = 1;
    private readonly _stages: StageConfigurator[] = [];

    constructor(
        private readonly _id: string,
        private readonly _name: string,
        private readonly _description: string
    ) {}

    /**
     * Set the maximum amount for concurrently running pipelines.
     * @default 1
     * @param maxConcurrentStages Define how many runs of the same pipeline are allowed simultaneously
     * @returns PipelineBuilder
     */
    public concurrentStages(maxConcurrentStages: number): PipelineConfigurator {
        this._maxConcurrentStages = maxConcurrentStages;
        return this;
    }

    /**
     * Initialize a new stage in the pipeline.
     * @param stageId Id of the stage
     * @param name Name of the stage
     * @param description Optional description to convey the purpose of the stage
     */
    public stage(stageId: string, name: string, description?: string): StageConfigurator {
        const builder = new StageConfigurator(this, stageId, name, description);
        this._stages.push(builder);
        return builder;
    }
}

/**
* Register a new pipeline builder. This is used
* to define a new pipeline.
* @param id The id of the new pipeline
* @param name Name of the pipeline
* @param description Optional description to convey the purpose of the pipeline
* @returns PipelineConfigurator
*/
export function pipeline(id: string, name: string, description?: string): PipelineConfigurator {
    return new PipelineConfigurator(id, name, description);
}
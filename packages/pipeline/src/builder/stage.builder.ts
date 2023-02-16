import { Resources } from "../entities/common.entity";
import { PipelineConfigurator } from "./pipeline.builder";
import { StepConfigurator } from "./step.builder";

export type StageInitializer = () => Promise<Resources>;

export class StageConfigurator {
    private readonly _steps: StepConfigurator[] = [];
    private _initializer: StageInitializer;
    private _dependsOn: string[] = [];

    constructor(
        private readonly pipelineBuilder: PipelineConfigurator,
        private readonly _id: string,
        private readonly _name: string,
        private readonly _description?: string
    ) {}

    public useResources(initializer: StageInitializer): StageConfigurator {
        this._initializer = initializer;
        return this;
    }

    public dependsOn(stageIds: string[]): StageConfigurator {
        this._dependsOn = stageIds;
        return this;
    }

    public step(id: string, name: string, description?: string): StepConfigurator {
        const configurator = new StepConfigurator(this, id, name, description);
        this._steps.push(configurator);
        return configurator;
    }

    public next(): PipelineConfigurator {
        return this.pipelineBuilder;
    }
}
import { StageRunner, StageRunnerSteps, StepRunner } from "../entities/pipeline.entity";

export class StageRunnerBuilder {

    private readonly steps: StageRunnerSteps = {};

    public step(id: string, runner: StepRunner): StageRunnerBuilder {
        this.steps[id] = runner;
        return this;
    }

    public build(): StageRunner {
        return {
            steps: this.steps
        }
    }
}

export function runner(): StageRunnerBuilder {
    return new StageRunnerBuilder();
}
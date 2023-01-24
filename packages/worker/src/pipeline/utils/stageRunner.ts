import { StageRunner, StageRunnerSteps } from "../entities/stage.entity";
import { StepRunner } from "../entities/step.entity";

export class StageRunnerBuilder {

    private readonly steps: StageRunnerSteps = {};

    /**
     * Register a runner for a step
     * @param id Id of the step used in module configuration
     * @param runner Runner function
     * @returns StageRunnerBuilder
     */
    public step(id: string, runner: StepRunner): StageRunnerBuilder {
        this.steps[id] = runner;
        return this;
    }

    /**
     * Build the final stage runner.
     * @returns StageRunner
     */
    public build(): StageRunner {
        return {
            steps: this.steps
        }
    }
}

/**
 * Initialize new stage runner builder
 * @returns StageRunnerBuilder
 */
export function runner(): StageRunnerBuilder {
    return new StageRunnerBuilder();
}
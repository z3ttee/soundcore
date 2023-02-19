import { StepConditionEvaluator, StepExecutor } from "../entities/step.entity";
import { StageConfigurator } from "./stage.builder";

export class StepConfigurator {
    private _runner: StepExecutor;
    private _conditionEvaluator: StepConditionEvaluator;

    constructor(
        private readonly stageBuilder: StageConfigurator,
        private readonly _id: string,
        private readonly _name: string,
        private readonly _description?: string
    ) {}

    public condition(evaluator: StepConditionEvaluator): StepConfigurator {
        this._conditionEvaluator = evaluator;
        return this;
    }

    public run(runner: StepExecutor): StageConfigurator {
        this._runner = runner;
        return this.stageBuilder;
    }
}
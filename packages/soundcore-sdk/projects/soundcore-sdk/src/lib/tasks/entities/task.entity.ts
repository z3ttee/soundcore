import { Environment, RunStatus } from "./common.entity";
import { Stage } from "./stage.entity";

export class Task {
    public readonly runId: string;
    public id: string;
    public name: string;
    public description?: string;
    public currentStageId: string;
    public status: RunStatus;
    public environment?: Environment;
    public stages: Stage[];
    public createdAt: number;
    public updatedAt?: number;
}
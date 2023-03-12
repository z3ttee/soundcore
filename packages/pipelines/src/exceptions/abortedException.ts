import { IStep } from "../entities/step.entity";

export class PipelineAbortedException {

    constructor(
        public readonly message: string,
        public readonly issuer: IStep
    ) {}

}
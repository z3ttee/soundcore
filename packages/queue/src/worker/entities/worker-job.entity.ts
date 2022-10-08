import { v4 as uuidv4 } from "uuid"

export class WorkerJob<T = any, R = any> {

    public readonly id: string = uuidv4();
    public result: R = undefined;
    public progress: number = 0.0;

    constructor(public readonly payload: T) {}

}
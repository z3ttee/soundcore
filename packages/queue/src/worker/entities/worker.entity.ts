import { v4 as uuidv4 } from "uuid"

export class Worker<T = any> {

    public readonly id: string = uuidv4();
    public readonly cwd: string = process.cwd();
    public readonly scriptPath: string;
    public readonly payload: T;

}
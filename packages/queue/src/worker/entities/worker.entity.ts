import { v4 as uuidv4 } from "uuid"

export class Worker {

    public readonly id: string = uuidv4();
    
    constructor(public readonly script: string) {}

}
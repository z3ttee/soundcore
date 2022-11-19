import { firstValueFrom, Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";

export enum JanitorTask {
    CLEAR_ONGOING_IMPORTS = 0
}

export class JanitorRef<T = any> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly task: JanitorTask
    ) {}
}

export class JanitorProcessRef<R = any> {

    constructor(
        public readonly janitor: JanitorRef,
        private readonly observable: Observable<R>
    ) {}

    public finally(): Promise<R> {
        return firstValueFrom(this.observable);
    }

}

export class Janitor<T = any> {

    public readonly ref: JanitorRef<T>;

    constructor(
        name: string,
        task: JanitorTask
    ) {
        this.ref = new JanitorRef<T>(uuidv4(), name, task);
    }

    public get id(): string {
        return this.ref.id;
    }

    public get name(): string {
        return this.ref.name;
    }

    public get task(): JanitorTask {
        return this.ref.task;
    }

}


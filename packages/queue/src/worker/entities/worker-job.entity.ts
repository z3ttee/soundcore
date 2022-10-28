import { v4 as uuidv4 } from "uuid"

export class WorkerJobRef<T = any> {
    public readonly isRef: boolean = true;

    constructor(
        public readonly id: string,
        public readonly payload: T,
        public progress: number = 0
    ) {}

    public static fromJob<T>(job: WorkerJob<T, any>) {
        return new WorkerJobRef<T>(job.id, job.payload, job.progress)
    }
}

export class WorkerJob<T = any, R = any> {

    public readonly id: string;
    public readonly payload: T;
    public progress: number = 0;
    public result: R = undefined;

    constructor(payload: T, id?: string, progress = 0) {
        this.id = id || uuidv4();
        this.payload = payload;
        this.progress = progress;
    }

    public static fromRef<T, R>(ref: WorkerJobRef<T>): WorkerJob<T, R> {
        return new WorkerJob(ref.payload, ref.id, ref.progress);
    }

    public static withPayload<T, R>(payload: T): WorkerJob<T, R> {
        return new WorkerJob(payload, uuidv4(), 0);
    }
}


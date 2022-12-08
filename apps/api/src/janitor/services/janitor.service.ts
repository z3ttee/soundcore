import { Injectable, Logger } from "@nestjs/common";
import { Environment } from "@soundcore/common";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { Observable, Subject } from "rxjs";
import { Janitor, JanitorProcessRef, JanitorTask } from "../entities/janitor.entity";

@Injectable()
export class JanitorService {
    private readonly logger = new Logger(JanitorService.name);

    private readonly janitors: Map<String, Subject<any>> = new Map();

    private readonly _completedSubject: Subject<string> = new Subject();
    public readonly $completed: Observable<string> = this._completedSubject.asObservable();

    constructor(
        private readonly queue: WorkerQueue<Janitor>
    ) {

        this.queue.on("failed", (jobRef: WorkerJobRef<Janitor>, error: Error) => {
            if(Environment.isDebug) {
                this.logger.error(`Janitor Task failed: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Janitor Task failed: ${error.message}`);
            }

            const janitorId = jobRef.payload?.ref?.id;
            this.sendCompletionForJanitor(janitorId, null);
        });

        this.queue.on("completed", (job: WorkerJob<Janitor>) => {
            this.logger.log(`Janitor task '${job.payload.ref.task}' completed.`);
            const janitorId = job.payload?.ref?.id;
            const result = job.result ?? null;
            this.sendCompletionForJanitor(janitorId, result);
        });

        this.queue.on("started", (job: WorkerJob<Janitor>) => {
            this.logger.log(`Janitor task '${job.payload.ref.task}' started.`);
        });

    }

    public async clearOngoingImports() {
        return this.run("ImportJanitor", JanitorTask.CLEAR_ONGOING_IMPORTS);
    }

    public async clearOldImports() {
        return this.run("ImportJanitor", JanitorTask.CLEAR_OLD_IMPORTS);
    }

    public async clearStreams() {
        return this.run("StreamJanitor", JanitorTask.CLEAR_STREAMS);
    }

    private async run(name: string, task: JanitorTask): Promise<JanitorProcessRef> {
        // Instantiate new janitor with handler
        const janitor = new Janitor(name, task);

        // Create subject to push completion
        const subject = new Subject<void>();

        // Register janitor
        this.registerJanitorSubject(janitor.id, subject);

        // Enqueue task
        this.queue.enqueue(janitor);

        // Return ref (safe-to-use version of janitor)
        return new JanitorProcessRef(janitor.ref, subject.asObservable());
    }

    private registerJanitorSubject(id: string, subject: Subject<void>) {
        this.janitors.set(id, subject);
    }

    private sendCompletionForJanitor(janitorId: string, result: any) {
        const subject = this.janitors.get(janitorId);
        this.unregisterJanitorSubject(janitorId);

        subject.next(result);
        subject.complete();
    }

    private unregisterJanitorSubject(id: string) {
        this.janitors.delete(id);
    }

}
import { Injectable } from "@nestjs/common";
import { WorkerJob, WorkerJobRef, WorkerQueue } from "@soundcore/nest-queue";
import { ImportTaskUpdateEvent } from "../../gateway/events/importtask-update.event";
import { GeneralGateway } from "../../gateway/gateways/general-gateway.gateway";
import { ImportTask, ImportTaskStatus } from "../entities/import.entity";
import { ImportService } from "./import.service";

@Injectable()
export class ImportQueueService {

    constructor(
        private readonly gateway: GeneralGateway,
        private readonly queue: WorkerQueue<ImportTask>,
        private readonly service: ImportService
    ) {

        this.queue.on("started", (job: WorkerJob<ImportTask>) => {
            this.updateImportTask(job.payload, ImportTaskStatus.PROCESSING, 0);
        });

        this.queue.on("completed", (job: WorkerJob<ImportTask>) => {
            this.updateImportTask(job.payload, ImportTaskStatus.OK, 0);
        });

        this.queue.on("failed", (job: WorkerJobRef<ImportTask>) => {
            this.updateImportTask(job.payload, ImportTaskStatus.ERRORED, 0);
        });
    }

    public enqueueTask(task: ImportTask) {
        this.queue.enqueue(task);
    }

    private async updateImportTask(task: ImportTask, status: ImportTaskStatus, progress: number) {
        const taskCopy = {...task};
        const user = task.user;

        taskCopy.user = undefined;
        taskCopy.status = status;
        taskCopy.progress = progress;

        this.gateway.sendEventToUser(user.id, new ImportTaskUpdateEvent(taskCopy));
        await this.service.setImportProgressAndStatus([task], status, progress);
    }

}
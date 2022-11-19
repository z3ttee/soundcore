import { Injectable, Logger } from '@nestjs/common';
import { ImportTask, ImportTaskStatus } from '../entities/import.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page, Pageable } from 'nestjs-pager';
import { ImportQueueService } from './import-queue.service';

@Injectable()
export class ImportService {
    private logger: Logger = new Logger(ImportService.name);

    constructor(
        @InjectRepository(ImportTask) private readonly repository: Repository<ImportTask>
    ) {}

    /**
     * Get repository.
     * @returns Repository<ImportTask>
     */
    public getRepository() {
        return this.repository;
    }

    /**
     * Create a task if it does not exist.
     * @param task Task to create
     * @returns ImportTask
     */
    public async createIfNotExists(task: ImportTask): Promise<ImportTask> {
        return this.repository.createQueryBuilder()
            .insert()
            .orIgnore()
            .returning(["id"])
            .values(task)
            .execute().then((insertResult) => {
                return this.repository.createQueryBuilder("task")
                    .leftJoin("task.user", "user").addSelect(["user.id", "user.username"])
                    .whereInIds(insertResult.identifiers)
                    .getOne();
            });
    }

    /**
     * Find a page of tasks started by a user.
     * @param userId User's id
     * @param pageable Page settings
     * @returns Page<ImportTask>
     */
    public async findAllByUser(userId: string, pageable: Pageable): Promise<Page<ImportTask>> {
        return this.repository.createQueryBuilder("task")
            .leftJoin("task.user", "user")
            .offset(pageable.offset)
            .limit(pageable.limit)
            .where("user.id = :userId", { userId })
            .getManyAndCount().then(([tasks, count]) => {
                return Page.of(tasks, count, pageable.offset);
            })
    }

    /**
     * Update status for a list of tasks.
     * @param tasks Tasks to change status for
     * @param status Status to set
     */
    public async updateImportStatus(tasks: ImportTask[], status: ImportTaskStatus) {
        return this.repository.createQueryBuilder()
            .update()
            .set({ status })
            .whereInIds(tasks)
            .execute()
    }

    /**
     * Update progress for a list of tasks.
     * @param tasks Tasks to change progress for
     * @param progress Progress to set
     */
    public async updateImportProgress(tasks: ImportTask[], progress: number) {
        return this.repository.createQueryBuilder()
            .update()
            .set({ progress })
            .whereInIds(tasks)
            .execute();
    }

    public async setImportProgressAndStatus(tasks: ImportTask[], status: ImportTaskStatus, progress: number) {
        return this.repository.createQueryBuilder()
            .update()
            .set({ progress, status })
            .whereInIds(tasks)
            .execute()
    }

    public async clearOngoingImports() {
        return this.repository.createQueryBuilder()
            .update()
            .set({ status: ImportTaskStatus.SERVER_ABORT, progress: 0 })
            .where("status IN(:status)", { status: [ ImportTaskStatus.ENQUEUED, ImportTaskStatus.PROCESSING ] })
            .execute()
    }

    /**
     * This will delete all imports from the database older
     * than 30days
     */
    public async clearOldImports() {
        const datePrior30daysMs = Date.now() - (1000*60*60*24*30);
        return this.repository.createQueryBuilder()
            .delete()
            .where("createdAt <= :datePrior30daysMs", { datePrior30daysMs })
            .execute();
    }

}

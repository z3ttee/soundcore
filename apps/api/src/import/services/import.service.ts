import { Injectable, Logger } from '@nestjs/common';
import { ImportTask, ImportTaskStatus } from '../entities/import.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page, Pageable } from 'nestjs-pager';

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
    public async updateImportStatus(tasks: ImportTask[], status: ImportTaskStatus): Promise<void> {
        return this.repository.createQueryBuilder()
            .update()
            .set({ status })
            .whereInIds(tasks)
            .execute().then((updateResult) => {
                if(updateResult.affected > 0) {
                    // TODO: Send update to websocket
                }
            });
    }

    /**
     * Update progress for a list of tasks.
     * @param tasks Tasks to change progress for
     * @param progress Progress to set
     */
    public async updateImportProgress(tasks: ImportTask[], progress: number): Promise<void> {
        return this.repository.createQueryBuilder()
            .update()
            .set({ progress })
            .whereInIds(tasks)
            .execute().then((updateResult) => {
                if(updateResult.affected > 0) {
                    // TODO: Send update to websocket
                }
            });
    }

    public async clearOngoingImports() {
        return this.repository.createQueryBuilder()
            .update()
            .set({ status: ImportTaskStatus.SERVER_ABORT, progress: 0 })
            .where("status IN(:status)", { status: [ ImportTaskStatus.ENQUEUED, ImportTaskStatus.PROCESSING ] })
            .execute()
    }

}

import { Injectable, Logger } from '@nestjs/common';
import { ImportTask, ImportTaskStatus, ImportTaskType } from '../entities/import.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Page, Pageable } from '@soundcore/common';

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
                    .leftJoin("task.user", "user").addSelect(["user.id", "user.name"])
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
    public async findByStatusOfUser(userId: string, status: ImportTaskStatus[], type: ImportTaskType, pageable: Pageable): Promise<Page<ImportTask>> {
        return this.repository.createQueryBuilder("task")
            .leftJoin("task.user", "user")
            .leftJoin("task.report", "report").addSelect(["report.id"])
            .offset(pageable.offset)
            .limit(pageable.limit)
            .where("user.id = :userId AND task.status IN (:status) AND task.type = :type", { userId, status, type })
            .getManyAndCount().then(([tasks, count]) => {
                return Page.of(tasks, count, pageable);
            })
    }

    /**
     * Set the payload of a task.
     * @param task Task to update
     * @param payload Payload to set
     * @returns Updated import task
     */
    public async setTaskPayload(task: ImportTask, payload: any) {
        return this.repository.update(task.id, {
            payload: payload
        }).then(() => {
            task.payload = payload;
            return task;
        });
    }

    /**
     * Set the stats of a task.
     * @param task Task to update
     * @param stats Stats to set
     * @returns Updated import task
     */
     public async setTaskStats(task: ImportTask, stats: any) {
        return this.repository.update(task.id, {
            stats: stats
        }).then(() => {
            task.stats = stats;
            return task;
        });
    }

    /**
     * Update status for a list of tasks.
     * @param tasks Tasks to change status for
     * @param status Status to set
     */
    public async setImportStatus(tasks: ImportTask[], status: ImportTaskStatus) {
        return this.repository.createQueryBuilder()
            .update()
            .set({ status })
            .whereInIds(tasks)
            .execute()
    }

    /**
     * Delete an import task by id and corresponding user.
     * @param taskId Task's id
     * @param authentication Authentication object
     * @returns True or False
     */
    public async deleteById(taskId: string, authentication: User): Promise<boolean> {
        return this.repository.createQueryBuilder("task")  
            .leftJoin("task.user", "user")
            .delete()
            .where("id = :taskId AND user.id = :userId", { taskId, userId: authentication.id })
            .execute().then((deleteResult) => {
                return deleteResult.affected > 0;
            })
    }

    /**
     * This will mark all imports from the database that are
     * marked as enqueued or processing as aborted. Main usage of this function is at application
     * startup to clear the queue and force the user to start import again because it got aborted
     * by the application shutdown.
     */
    public async clearOngoingImports() {
        return this.repository.createQueryBuilder()
            .update()
            .set({ status: ImportTaskStatus.SERVER_ABORT })
            .where("status IN(:status)", { status: [ ImportTaskStatus.ENQUEUED, ImportTaskStatus.PROCESSING ] })
            .execute()
    }

    /**
     * This will delete all imports from the database older
     * than 7days
     */
    public async clearOldImports() {
        const datePrior7daysMs = Date.now() - (1000*60*60*24*7);
        return this.repository.createQueryBuilder()
            .delete()
            .where("createdAt <= :datePrior7daysMs AND status NOT IN (:status)", { datePrior7daysMs, status: [ ImportTaskStatus.PROCESSING, ImportTaskStatus.ENQUEUED ] })
            .execute();
    }

}

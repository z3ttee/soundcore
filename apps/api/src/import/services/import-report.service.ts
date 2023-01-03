import { Injectable, Logger } from '@nestjs/common';
import { ImportTask } from '../entities/import.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportReport } from '../entities/import-report.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class ImportReportService {
    private logger: Logger = new Logger(ImportReportService.name);

    constructor(
        @InjectRepository(ImportReport) private readonly repository: Repository<ImportReport>
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
    public async createIfNotExistsForTask(task: ImportTask, data: any): Promise<ImportReport> {
        const report = new ImportReport();
        report.task = { id: task.id } as ImportTask;
        report.data = data;

        return this.repository.createQueryBuilder()
            .insert()
            .orIgnore()
            .returning(["id"])
            .values(report)
            .execute().then(async (insertResult) => {
                if(insertResult.identifiers.length <= 0) return null;

                const result = await this.repository.createQueryBuilder("report")
                .whereInIds(insertResult.identifiers)
                .select(["id", "data", "createdAt"])
                .getOne();

                task.report = result;
                return result;
            });
    }

    /**
     * Find a report by its corresponding task.
     * @param taskId Task's id
     * @returns ImportReport
     */
    public async findByTaskId(taskId: string, authentication: User): Promise<ImportReport> {
        return this.repository.createQueryBuilder("report")
            .leftJoinAndSelect("report.task", "task")
            .leftJoin("task.user", "user").addSelect(["user.id", "user.name"])
            .where("task.id = :taskId AND user.id = :userId", { taskId, userId: authentication.id })
            .getOne();
    }

}

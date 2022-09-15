import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Page, Pageable } from 'nestjs-pager';
import path from 'path';
import { Repository } from 'typeorm';
import { EVENT_FILE_FOUND, EVENT_FILE_PROCESSED, QUEUE_FILE_NAME } from '../../constants';
import { FileDTO } from '../../mount/dtos/file.dto';
import { Mount } from '../../mount/entities/mount.entity';
import { Song } from '../../song/entities/song.entity';
import { CreateResult } from '../../utils/results/creation.result';
import { FileProcessDTO, FileProcessMode } from '../dto/file-process.dto';
import { File, FileFlag } from '../entities/file.entity';

@Injectable()
export class FileService {
    private readonly logger: Logger = new Logger(FileService.name);

    constructor(
        @InjectRepository(File) private readonly repository: Repository<File>,
        private readonly eventEmitter: EventEmitter2,
        @InjectQueue(QUEUE_FILE_NAME) private readonly queue?: Queue<FileProcessDTO>
    ) {
        this.queue?.on("failed", (job, err) => {
            const filepath = path.join(job.data.file.mount.directory, job.data.file.directory, job.data.file.filename);
            this.logger.error(`Could not process file '${filepath}': ${err.message}`, err.stack);
        })
        this.queue?.on("completed", (job, result: File) => {
            this.eventEmitter.emit(EVENT_FILE_PROCESSED, result);
        })
    }

    /**
     * Handle file found event.
     * This event is emitted by the mount service, after a new 
     * file was found.
     * @param file Found file data
     * @param workerOptions Worker options
     */
    @OnEvent(EVENT_FILE_FOUND)
    public handleFileFoundEvent(file: FileDTO) {
        return this.processFile(file);
    }

    public async findById(fileId: string): Promise<File> {
        return this.repository.createQueryBuilder("file")
            .leftJoinAndSelect("file.song", "song")
            .leftJoinAndSelect("file.mount", "mount")
            .where("file.id = :fileId", { fileId })
            .getOne();
    }

    /**
     * Find a file by its name and sub-directory in mount.
     * @param name File's name
     * @param directory Sub-Directory in mount
     * @returns File
     */
    public async findByNameAndDirectory(name: string, mount: Mount, directory?: string): Promise<File> {
        return this.repository.createQueryBuilder("file")
            .leftJoinAndSelect("file.mount", "mount")
            .where("file.name = :name AND file.directory = :directory AND mount.id = :mountId", { name, directory, mountId: mount.id })
            .getOne()
    }

    /**
     * Find page of files of a mount.
     * @param mountId Mount's id
     * @param pageable Page settings
     * @returns Page<File>
     */
    public async findByMount(mountId: string, pageable: Pageable): Promise<Page<File>> {
        const result = await this.repository.createQueryBuilder("file")
            .leftJoin("file.mount", "mount")
            .leftJoinAndSelect("file.song", "song")
            .where("mount.id = :mountId", { mountId })
            .getManyAndCount()

        return Page.of(result[0], result[1], pageable.page);
    }

    /**
     * Set the song of a file.
     * @param idOrObject Id or file object
     * @param song Song
     * @returns File
     */
    public async setSong(idOrObject: string | File, song: Song): Promise<File> {
        const file = await this.resolveFile(idOrObject);
        if(!file) throw new NotFoundException("File not found.");
        if(file.song?.id == song.id) return file;

        file.song = song;
        return this.repository.save(file);
    }

    /**
     * Set the flag of a file.
     * @param idOrObject Id or file object
     * @param flag Updated flag
     * @returns File
     */
    public async setFlag(idOrObject: string | File, flag: FileFlag): Promise<File> {
        const file = await this.resolveFile(idOrObject);
        if(!file) throw new NotFoundException("File not found.");
        if(file.flag == flag) return file;

        file.flag = flag;
        return this.repository.save(file);
    }

    /**
     * Find or create a file entry by the given data.
     * This will return the file and a boolean, indicating if the
     * file already existed.
     * @param fileDto Info about the file
     * @returns [File, boolean]
     */
    public async findOrCreateFile(fileDto: FileDTO): Promise<CreateResult<File>> {
        const existingFile = await this.findByNameAndDirectory(fileDto.filename, fileDto.mount, fileDto.directory);
        if(existingFile) return new CreateResult(existingFile, true);

        const file = this.repository.create();
        file.flag = FileFlag.OK;
        file.mount = fileDto.mount;
        file.directory = fileDto.directory;
        file.name = fileDto.filename;
        file.size = fileDto.size || 0;

        return this.repository.createQueryBuilder()
            .insert()
            .values(file)
            .orIgnore()
            .execute().then((result) => {
                if(result.identifiers.length > 0) {
                    return new CreateResult(file, false);
                }
                return this.findByNameAndDirectory(fileDto.filename, fileDto.mount, fileDto.directory).then((file) => new CreateResult(file, true));
            }).catch((error) => {
                this.logger.error(`Could not create database entry for file: ${error.message}`, error.stack);
                return null
            })
    }

    /**
     * Resolve the id or object to a file object.
     * @param idOrObject Id or file object
     * @returns File
     */
    private async resolveFile(idOrObject: string | File): Promise<File> {
        if(typeof idOrObject == "string") {
            return this.findById(idOrObject);
        }

        return idOrObject;
    }

    /**
     * Trigger the processing of a file. This will add the file
     * to a queue. The queue's processor creates all needed database entries, metadata etc.
     * @param fileDto Data to feed into the Queue (Processor)
     */
    private async processFile(file: FileDTO, mode: FileProcessMode = FileProcessMode.SCAN) {
        const processDto = new FileProcessDTO(file, mode);
        return this.queue.add(processDto);
    }

}

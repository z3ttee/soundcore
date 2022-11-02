import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePageable, Page } from 'nestjs-pager';
import { Repository, UpdateResult } from 'typeorm';
import { Mount } from '../../mount/entities/mount.entity';
import { Song } from '../../song/entities/song.entity';
import { CreateResult } from '../../utils/results/creation.result';
import { CreateFileDTO } from '../dto/create-file.dto';
import { File, FileFlag } from '../entities/file.entity';

@Injectable()
export class FileService {
    private readonly logger: Logger = new Logger(FileService.name);

    constructor(
        @InjectRepository(File) private readonly repository: Repository<File>
    ) {}

    public async findById(fileId: string): Promise<File> {
        return this.repository.createQueryBuilder("file")
            .leftJoinAndSelect("file.song", "song")
            .leftJoinAndSelect("file.mount", "mount")
            .where("file.id = :fileId", { fileId })
            .getOne();
    }

    public async findByFlagAndMount(mountId: string, flag: FileFlag) {
        return this.repository.createQueryBuilder("file")
            .leftJoin("file.mount", "mount")
            .where("file.flag = :flag AND mount.id = :mountId", { flag, mountId })
            .getMany();
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
    public async findByMount(mountId: string, pageable: BasePageable): Promise<Page<File>> {
        const result = await this.repository.createQueryBuilder("file")
            .leftJoin("file.mount", "mount")
            .leftJoinAndSelect("file.song", "song")
            .where("mount.id = :mountId", { mountId })
            .offset(pageable.offset)
            .limit(pageable.limit)
            .getManyAndCount()

        return Page.of(result[0], result[1]);
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

    public async setFlags(files: File[], flag: FileFlag): Promise<UpdateResult> {
        return this.repository.createQueryBuilder()
            .update()
            .set({ flag })
            .whereInIds(files)
            .execute();
    }

    /**
     * Find or create a file entry by the given data.
     * This will return the file and a boolean, indicating if the
     * file already existed.
     * @param createFileDto Info about the file
     * @returns [File, boolean]
     */
    public async findOrCreateFile(createFileDto: CreateFileDTO): Promise<CreateResult<File>> {
        const { fileDto, mount } = createFileDto;
        const existingFile = await this.findByNameAndDirectory(fileDto.filename, mount, fileDto.directory);
        if(existingFile) return new CreateResult(existingFile, true);

        const file = this.repository.create();
        file.flag = FileFlag.OK;
        file.mount = mount;
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
                return this.findByNameAndDirectory(fileDto.filename, mount, fileDto.directory).then((file) => new CreateResult(file, true));
            }).catch((error) => {
                this.logger.error(`Could not create database entry for file: ${error.message}`, error.stack);
                return null
            })
    }

    /**
     * Save file objects to database. If they exist, insertion
     * will be ignored.
     * @param files 
     * @returns 
     */
    public async createFiles(files: File[]): Promise<File[]> {
        return this.repository.createQueryBuilder()
            .insert()
            .values(files)
            .orIgnore()
            .execute().then(async (result) => {
                // Make db request to fetch affected rows
                return this.repository.findBy(result.identifiers);
            }).catch((error: Error) => {
                this.logger.error(`Failed creating database entries for files batch: ${error.message}`, error.stack);
                return [];
            });
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

}

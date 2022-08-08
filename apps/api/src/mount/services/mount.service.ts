import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { Page, Pageable } from 'nestjs-pager';
import path from 'path';
import { Repository } from 'typeorm';
import { Bucket } from '../../bucket/entities/bucket.entity';
import { QUEUE_MOUNTSCAN_NAME } from '../../constants';
import { CreateMountDTO } from '../dtos/create-mount.dto';
import { UpdateMountDTO } from '../dtos/update-mount.dto';
import { Mount } from '../entities/mount.entity';
import { MountScanProcessDTO } from '../dtos/mount-scan.dto';
import { Random } from '@tsalliance/utilities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResult } from '../../utils/results/creation.result';
import { RedlockError } from '../../exceptions/redlock.exception';
import { FileSystemService } from '../../filesystem/services/filesystem.service';

@Injectable()
export class MountService {
    private readonly logger: Logger = new Logger(MountService.name);

    constructor(
        @InjectRepository(Mount) private readonly repository: Repository<Mount>,
        private readonly fileSystem: FileSystemService,
        @InjectQueue(QUEUE_MOUNTSCAN_NAME) private readonly queue: Queue<MountScanProcessDTO>
    ) { }

    /**
     * Find a list of mounts inside a bucket.
     * @param bucketId Bucket's id
     * @param pageable Page settings
     * @returns Page<Mount>
     */
    public async findByBucketId(bucketId: string, pageable: Pageable): Promise<Page<Mount>> {
        if(!pageable) throw new BadRequestException("Missing page settings");

        const query = await this.repository.createQueryBuilder("mount")
            .leftJoin("mount.bucket", "bucket")
            .leftJoin("mount.files", "file")
            .loadRelationCountAndMap("mount.filesCount", "mount.files")

            .addSelect("SUM(file.size) AS usedSpace")
            .groupBy("mount.id")
            .where("bucket.id = :bucketId", { bucketId })
        
        const result = await query.getRawAndEntities();
        const totalElements = await query.getCount();
        return Page.of(result.entities.map((mount, index) => {
            mount.usedSpace = result.raw[index]?.usedSpace || 0
            return mount;
        }), totalElements, pageable.page);
    }

    /**
     * Find a mount by its id including the bucket relationship.
     * @param mountId Mount's id
     * @returns Mount
     */
    public async findById(mountId: string): Promise<Mount> {
        return await this.repository.createQueryBuilder("mount")
            .leftJoinAndSelect("mount.bucket", "bucket")
            .leftJoin("mount.files", "file")
            .loadRelationCountAndMap("mount.filesCount", "mount.files")
            .addSelect("SUM(file.size) AS mount_usedSpace")
            .where("mount.id = :mountId", { mountId })
            .groupBy("mount.id")
            .getOne()
    }

    /**
     * Find random bucket in mount.
     * Used for example in setRandomAsDefaultMount()
     * @param exclude Exclude a set of mounts
     * @returns Mount
     */
    public async findOneInBucket(exclude: string[]): Promise<Mount> {
        return await this.repository.createQueryBuilder("mount")
            .leftJoinAndSelect("mount.bucket", "bucket")
            .leftJoin("mount.files", "file")
            .loadRelationCountAndMap("mount.filesCount", "mount.files")
            .addSelect("SUM(file.size) AS mount_usedSpace")
            .where("mount.id NOT IN(:exclude)", { exclude })
            .groupBy("mount.id")
            .getOne()
    }

    /**
     * Find a mount by its name in a specific bucket.
     * @param bucketId Bucket's id
     * @param name Name of the mount
     * @returns Mount
     */
    public async findByNameInBucket(bucketId: string, name: string): Promise<Mount> {
        return await this.repository.findOne({ where: { name, bucket: { id: bucketId } }, relations: ["bucket"]});
    }

    /**
     * Find a mount inside a bucket that has mounted a specific directory
     * @param bucketId Bucket id
     * @param directory Directory
     * @returns Mount
     */
    public async findByDirectoryInBucket(bucketId: string, directory: string): Promise<Mount> {
        return await this.repository.findOne({ where: { directory: path.resolve(directory), bucket: { id: bucketId } }, relations: ["bucket"]});
    }

    /**
     * Find the default mount of a bucket
     * @param bucketId Bucket's id
     * @returns Mount
     */
    public async findDefaultOfBucket(bucketId: string): Promise<Mount> {
        return await this.repository.findOne({ where: { isDefault: true, bucket: { id: bucketId }}, relations: ["bucket"]});
    }

    /**
     * Find the default mount of current bucket
     * @returns Mount
     */
    public async findDefault(): Promise<Mount> {
        return this.findDefaultOfBucket(this.fileSystem.getInstanceId());
    }

    /**
     * Check if a mount with certain name already exists inside bucket
     * @param bucketId Bucket's id
     * @param name Name of the bucket
     * @returns True or False
     */
    public async existsByNameInBucket(bucketId: string, name: string): Promise<boolean> {
        return !!(await this.repository.findOne({ where: { name, bucket: { id: bucketId } }}));
    }

    /**
     * Check if a mount with certain path already exists inside bucket
     * @param bucketId Bucket's id
     * @param path Path of the bucket
     * @returns True or False
     */
    public async existsByPathInBucket(bucketId: string, directory: string): Promise<boolean> {
        return !!(await this.repository.findOne({ where: { directory, bucket: { id: bucketId } }}));
    }

    /**
     * Trigger scan for a mount. This will create a new job and add it
     * to the directory scan queue.
     * @param idOrObject Mount ID or Object
     * @returns Job<Mount>
     */
    public async rescanMount(idOrObject: string | Mount): Promise<Bull.Job<MountScanProcessDTO>> {
        const mount = await this.resolveMount(idOrObject);
        const priority = mount.filesCount;

        return this.queue.add(new MountScanProcessDTO(mount), { priority }).then((job) => {
            this.logger.debug(`Added mount '${mount.name} #${job.id}' to scanner queue.`);
            return job;
        });
    }

    /**
     * Create new mount in database.
     * @param createMountDto Mount data
     * @returns Mount
     */
    public async createIfNotExists(createMountDto: CreateMountDTO): Promise<CreateResult<Mount>> {
        createMountDto.name = createMountDto.name?.trim();
        createMountDto.directory = this.fileSystem.resolveMountDirectory(createMountDto.directory);
        const directory = createMountDto.directory

        const existingMount = await this.findByNameInBucket(createMountDto.bucketId, createMountDto.name) || await this.findByDirectoryInBucket(createMountDto.bucketId, createMountDto.directory);
        if(existingMount) return new CreateResult(existingMount, true);

        const mount = this.repository.create();
        mount.name = createMountDto.name;
        mount.directory = directory;
        mount.bucket = { id: createMountDto.bucketId } as Bucket;

        return this.repository.createQueryBuilder()
            .insert()
            .values(mount)
            .orIgnore()
            .execute().then((result) => {
                if(result.identifiers.length > 0) {
                    return new CreateResult(mount, false);
                }
                return this.findByNameInBucket(createMountDto.bucketId, createMountDto.name).then((mount) => {
                    if(createMountDto.setAsDefault) this.setDefaultMount(mount);
                    if(createMountDto.doScan) this.rescanMount(mount);
                    return new CreateResult(mount, true)
                });
            }).catch((error) => {
                this.logger.error(`Could not create database entry for mount: ${error.message}`, error.stack);
                return null
            })
    }

    /**
     * Update existing mount.
     * @param mountId Mount's id
     * @param updateMountDto Mount's updated data
     * @returns Mount
     */
    public async update(mountId: string, updateMountDto: UpdateMountDTO): Promise<Mount> {
        updateMountDto.name = updateMountDto.name?.trim();
        const mount = await this.findById(mountId);

        if(!mount || !mount.bucket) {
            throw new NotFoundException("Mount not found.")
        }

        if(updateMountDto.name && updateMountDto.name != mount.name && await this.existsByNameInBucket(mount.bucket.id, updateMountDto.name)) {
            throw new BadRequestException("Mount with that name already exists inside this bucket.");
        }

        mount.name = updateMountDto.name;
        
        if(mount.isDefault && !updateMountDto.setAsDefault) {
            // Mount is removed as default mount, but no other mount
            // is selected to be next default --> select random one
            if(!await this.setRandomAsDefaultMount([mount.id])) {
                throw new BadRequestException("Cannot remove this mount as default mount as it is the only mount in the bucket.");
            } else {
                mount.isDefault = false;
            }
        }

        return this.repository.save(mount).then(async (result) => {
            if(updateMountDto.setAsDefault) await this.setDefaultMount(mount);
            if(updateMountDto.doScan) this.rescanMount(mount);
            return result;
        });
    }

    /**
     * Check if there is a default mount existing
     * for the current bucket.
     * If not, a mount is created and will be set as
     * default.
     */
    public async checkForDefaultMount() {
        const defaultMount = await this.findDefaultOfBucket(this.fileSystem.getInstanceId());

        if(!defaultMount) {
            return this.createIfNotExists({
                bucketId: this.fileSystem.getInstanceId(),
                directory: this.fileSystem.resolveInitialMountPath(),
                name: `Default Mount #${Random.randomString(4)}`,
                setAsDefault: true,
            });
        }

        return defaultMount;
    }

    /**
     * Set a mount to the default mount inside its bucket.
     * @param bucketId Bucket's id to set default mount in
     * @param idOrObject Mount Object or ID
     * @returns Mount
     */
    public async setDefaultMount(idOrObject: string | Mount): Promise<Mount> {
        const mount = await this.resolveMount(idOrObject);
        if(!mount) throw new NotFoundException("Mount not found.");
        if(mount.isDefault) return mount;

        mount.isDefault = true;
        return this.repository.manager.transaction<Mount>(async (manager) => {
            await manager.createQueryBuilder().update(Mount).set({ isDefault: false }).where("isDefault = :isDefault AND bucketId = :bucketId", { isDefault: true, bucketId: mount.bucket.id }).execute();
            return manager.save(mount).then((m) => {
                this.logger.log(`Set mount '${mount.name}' as default mount.`);
                return m;
            });
        })
    }

    /**
     * Set a random mount in bucket as default.
     * @param exclude Exclude a set of mounts
     * @returns Mount that has been set as default.
     */
    public async setRandomAsDefaultMount(exclude: string[]): Promise<Mount> {
        const mount = await this.findOneInBucket(exclude);
        if(!mount) return null;

        return this.setDefaultMount(mount).then((result) => {
            this.logger.verbose(`Mount '${mount.name}' was set to be new default mount for bucket '${mount.bucket?.id}'.`)
            return result;
        }).catch(() => {
            return null;
        });
    }

    /**
     * Check mounts on current bucket.
     * This will read all mounts from the database and add them
     * to the scanner queue for directory scanning.
     */
    public async checkMounts() {
        const options: Pageable = new Pageable(0, 30);

        let page: Page<Mount>;
        let fetchedElements = 0;
    
        while(fetchedElements < page?.totalElements || page == null) {
            page = await this.findByBucketId(this.fileSystem.getInstanceId(), options);
            options.page++;
            fetchedElements += page.size;

            for(const mount of page.elements) {
                this.rescanMount(mount);
            }
        }
    }

    /**
     * Delete mount by its id.
     * @param mountId Mount's id
     * @returns boolean
     */
    public async delete(mountId: string): Promise<boolean> {
        const mount = await this.resolveMount(mountId);
        if(!mount) return true;

        if(!await this.setRandomAsDefaultMount([mount.id])) {
            throw new BadRequestException("Cannot delete default mount. First, select an other mount as default.");
        }
        
        return this.repository.delete({ id: mountId }).then((result) => {
            return result.affected > 0;
        })
    }

    /**
     * Resolves a value to a mount object. The parameter must be either a valid mount id
     * or the mount object itself.
     * @param idOrObject Mount or Mount id
     * @returns Mount
     */
    private async resolveMount(idOrObject: string | Mount): Promise<Mount> {
        if(typeof idOrObject == "string") {
            return await this.findById(idOrObject);
        } else {
            return idOrObject;
        }
    }

    /**
     * Update the last scanned date in the database.
     * @param idOrObject Id or Mount object
     * @returns Mount
     */
    public async updateLastScanned(idOrObject: string | Mount): Promise<Mount> {
        const mount = await this.resolveMount(idOrObject);
        mount.lastScannedAt = new Date();

        return this.repository.save(mount);
    }

}

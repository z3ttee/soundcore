import path from 'node:path';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Page, Pageable } from 'nestjs-pager';
import { Repository } from 'typeorm';
import { Zone } from '../../zone/entities/zone.entity';
import { CreateMountDTO } from '../dtos/create-mount.dto';
import { UpdateMountDTO } from '../dtos/update-mount.dto';
import { Mount, MountProgress, MountStatus } from '../entities/mount.entity';
import { Random } from '@tsalliance/utilities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResult } from '../../utils/results/creation.result';
import { FileSystemService } from '../../filesystem/services/filesystem.service';
import { WorkerQueue } from '@soundcore/nest-queue';
import { MountRegistryService } from './mount-registry.service';
import { MountScanFlag, MountScanProcessDTO } from '../dtos/scan-process.dto';
import { FileFlag } from '../../file/entities/file.entity';
import { Environment } from '@soundcore/common';
import { EVENT_MOUNT_PROCESS_UPDATE, MOUNTNAME_MAX_LENGTH, MOUNT_MAX_STEPS, MOUNT_STEP_WAITING } from '../../constants';
import { AdminGateway } from '../../gateway/gateways/admin-gateway.gateway';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MountService {
    private readonly logger: Logger = new Logger(MountService.name);

    constructor(
        @InjectRepository(Mount) private readonly repository: Repository<Mount>,
        private readonly fileSystem: FileSystemService,
        private readonly mountRegistryService: MountRegistryService,
        private readonly queue: WorkerQueue<MountScanProcessDTO>,
        private readonly gateway?: AdminGateway
    ) {}

    /**
     * Find a list of mounts inside a bucket.
     * @param bucketId Bucket's id
     * @param pageable Page settings
     * @returns Page<Mount>
     */
    public async findByBucketId(bucketId: string, pageable: Pageable): Promise<Page<Mount>> {
        if(!pageable) throw new BadRequestException("Missing page settings");

        const query = await this.repository.createQueryBuilder("mount")
            .leftJoin("mount.zone", "bucket")
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
            .leftJoinAndSelect("mount.zone", "bucket")
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
            .leftJoinAndSelect("mount.zone", "bucket")
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
        return await this.repository.findOne({ where: { name, zone: { id: bucketId } }, relations: ["zone"]});
    }

    /**
     * Find a mount inside a bucket that has mounted a specific directory
     * @param bucketId Bucket id
     * @param directory Directory
     * @returns Mount
     */
    public async findByDirectoryInBucket(bucketId: string, directory: string): Promise<Mount> {
        return await this.repository.findOne({ where: { directory: path.resolve(directory), zone: { id: bucketId } }, relations: ["zone"]});
    }

    /**
     * Find the default mount of a bucket
     * @param bucketId Bucket's id
     * @returns Mount
     */
    public async findDefaultOfBucket(bucketId: string): Promise<Mount> {
        return this.repository.createQueryBuilder("mount")
            .leftJoinAndSelect("mount.zone", "bucket")
            .where("bucket.id = :bucketId AND mount.isDefault = :isDefault", { bucketId: bucketId, isDefault: 1 })
            .getOne();
    }

    /**
     * Find the default mount of current bucket
     * @returns Mount
     */
    public async findDefault(): Promise<Mount> {
        return this.findDefaultOfBucket(this.fileSystem.getInstanceId());
    }

    /**
     * Find a list of mounts from the database that have relations
     * with files that still need to be analysed (they have their flag set to PENDING_ANALYSIS).
     * This is useful when re-enqueueing these files after the service crashed or restarted.
     * @returns Mount[]
     */
    public async findHasAwaitingFiles(): Promise<Mount[]> {
        return this.repository.createQueryBuilder("mount")
            .leftJoin("mount.files", "file")
            .where("file.flag = :flag", { flag: FileFlag.PENDING_ANALYSIS })
            .getMany();
    }

    /**
     * Check if a mount with certain name already exists inside bucket
     * @param bucketId Bucket's id
     * @param name Name of the bucket
     * @returns True or False
     */
    public async existsByNameInBucket(bucketId: string, name: string): Promise<boolean> {
        return !!(await this.repository.findOne({ where: { name, zone: { id: bucketId } }}));
    }

    /**
     * Check if a mount with certain path already exists inside bucket
     * @param bucketId Bucket's id
     * @param path Path of the bucket
     * @returns True or False
     */
    public async existsByPathInBucket(bucketId: string, directory: string): Promise<boolean> {
        return !!(await this.repository.findOne({ where: { directory, zone: { id: bucketId } }}));
    }

    /**
     * Trigger scan for a mount. This will create a new job and add it
     * to the directory scan queue.
     * @param idOrObject Mount ID or Object
     * @returns Job<Mount>
     */
    public async rescanMount(idOrObject: string | Mount): Promise<number> {
        const mount = await this.resolveMount(idOrObject);
        if(!mount) throw new NotFoundException("Mount not found");

        return this.enqueue(mount, MountScanFlag.RESCAN);
    }

    /**
     * Trigger scan for a mount. This will create a new job and add it
     * to the directory scan queue.
     * @param idOrObject Mount ID or Object
     * @returns Job<Mount>
     */
    private async scanMountInternal(idOrObject: string | Mount): Promise<number> {
        const mount = await this.resolveMount(idOrObject);
        if(!mount) throw new NotFoundException("Mount not found");

        return this.enqueue(mount, MountScanFlag.DEFAULT_SCAN);
    }

    private async enqueue(mount: Mount, flag: MountScanFlag) {
        await this.setProgressInfoAndEmit(mount, {
            mountId: mount.id,
            maxSteps: MOUNT_MAX_STEPS,
            currentStep: 0,
            info: MOUNT_STEP_WAITING,
            progress: -1
        }, MountStatus.ENQUEUED);

        return this.queue.enqueue({
            mount: mount,
            flag: flag
        });

        return 0
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

        const existingMount = await this.findByNameInBucket(createMountDto.bucket.id, createMountDto.name) || await this.findByDirectoryInBucket(createMountDto.bucket.id, createMountDto.directory);
        if(existingMount) return new CreateResult(existingMount, true);

        const mount = this.repository.create();
        mount.name = createMountDto.name;
        mount.directory = directory;
        mount.zone = createMountDto.bucket as Zone;
        mount.discriminator = Random.randomString(4);

        return this.repository.createQueryBuilder()
            .insert()
            .values(mount)
            .orIgnore()
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length < 0) {
                    return this.findByNameInBucket(createMountDto.bucket.id, createMountDto.name).then((existingMount) => {
                        return new CreateResult(existingMount, false);
                    });
                }

                return this.findById(insertResult.identifiers[0].id).then((result) => {
                    if(createMountDto.isDefault) this.setDefaultMount(result);
                    if(createMountDto.doScan) this.rescanMount(mount);
                    return new CreateResult(mount, true)
                })
            }).catch((error) => {
                this.logger.error(`Could not create database entry for mount: ${error.message}`, error.stack);
                return null
            })
    }


    public async createMultipleIfNotExists(createMountDtos: CreateMountDTO[]): Promise<Mount[]> {
        return this.repository.createQueryBuilder()
            .insert()
            .orIgnore()
            .values(createMountDtos)
            .returning(["id"])
            .execute().then((insertResult) => {
                return this.repository.createQueryBuilder("mount")
                    .leftJoinAndSelect("mount.zone", "bucket")
                    .whereInIds(insertResult.raw)
                    .getMany();
            });
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

        if(!mount || !mount.zone) {
            throw new NotFoundException("Mount not found.")
        }

        if(updateMountDto.name && updateMountDto.name != mount.name && await this.existsByNameInBucket(mount.zone.id, updateMountDto.name)) {
            throw new BadRequestException("Mount with that name already exists inside this bucket.");
        }

        mount.name = updateMountDto.name;
        
        if(mount.isDefault && !updateMountDto.isDefault) {
            // Mount is removed as default mount, but no other mount
            // is selected to be next default --> select random one
            if(!await this.setRandomAsDefaultMount([mount.id])) {
                throw new BadRequestException("Cannot remove this mount as default mount as it is the only mount in the bucket.");
            } else {
                mount.isDefault = false;
            }
        }

        return this.repository.save(mount).then(async (result) => {
            if(updateMountDto.isDefault) await this.setDefaultMount(mount);
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
        return this.findDefault().then((defaultMount) => {
            if(typeof defaultMount !== "undefined" && defaultMount != null) {
                return defaultMount;
            }

            // Create the default mount, should always
            // be the default mount if no other default mount exists.
            return this.createIfNotExists({
                bucket: { id: this.fileSystem.getInstanceId() },
                directory: this.fileSystem.resolveInitialMountPath(),
                name: this.formatName("Default Mount"),
                isDefault: true,
                doScan: false
            }).then((result) => result.data);
        });
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
            await manager.createQueryBuilder().update(Mount).set({ isDefault: false }).where("isDefault = :isDefault AND zoneId = :bucketId", { isDefault: true, zoneId: mount.zone.id }).execute();
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
            this.logger.verbose(`Mount '${mount.name}' was set to be new default mount for bucket '${mount.zone?.id}'.`)
            return result;
        }).catch(() => {
            return null;
        });
    }

    /**
     * Set a progress object on the database entry of a mount.
     * @param idOrObject Id or Mount
     * @param progress Progress info. Can be null to clear info
     */
    public async setProgressInfo(idOrObject: string | Mount, progress: MountProgress, status: MountStatus = MountStatus.BUSY): Promise<Mount> {
        const mount = await this.resolveMount(idOrObject);
        if(!mount) throw new NotFoundException("Mount not found.");

        mount.progressInfo = progress;
        return this.repository.update(mount.id, {
            status: status,
            progressInfo: progress
        }).then(() => mount);
    }

    /**
     * Set a progress object on the database entry of a mount.
     * @param idOrObject Id or Mount
     * @param progress Progress info. Can be null to clear info
     */
    public async setProgressInfoAndEmit(idOrObject: string | Mount, progress: MountProgress, status: MountStatus = MountStatus.BUSY): Promise<Mount> {
        return this.setProgressInfo(idOrObject, progress, status).then((mount) => {
            return this.gateway?.sendMountStatusUpdate(mount, status, progress).then(() => mount);
        });
    }

    /**
     * Check mounts on current bucket.
     * This will read all mounts from the database and add them
     * to the scanner queue for directory scanning.
     */
    public async checkMountsDockerMode() {
        if(!Environment.isDockerized) throw new InternalServerErrorException(`Tried checking mounts in docker mode, but application is in standalone mode.`);
        
        this.queue.enqueue(<MountScanProcessDTO>{
            flag: MountScanFlag.DOCKER_LOOKUP,
            mount: null
        });
    }

    /**
     * Function used to check for mounts when the application is in standalone
     * mode. This will fetch all registered soundcore mounts from the database and
     * enqueue all found mounts for scanning.
     * This function is also called, after all mounted directories via docker volumes
     * are registered as mounts.
     */
    public async checkMountsStandaloneMode() {
        const options: Pageable = new Pageable(0, 30);

        let page: Page<Mount>;
        let fetchedElements = 0;
        let pageIndex = options.page;
    
        while(fetchedElements < page?.totalElements || page == null) {
            page = await this.findByBucketId(this.fileSystem.getInstanceId(), options);
            pageIndex++;
            fetchedElements += page.size;

            for(const mount of page.elements) {
                this.scanMountInternal(mount).catch((error: Error) => {
                    this.logger.error(`Could not trigger scanning process for mount '${mount?.name}': ${error.message}`);
                });
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

    public formatName(name: string): string {
        return `${name.slice(0, Math.min(MOUNTNAME_MAX_LENGTH, name.length))}`;
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

        return this.repository.update(mount.id, {
            lastScannedAt: mount.lastScannedAt
        }).then(() => mount);
    }

    @OnEvent(EVENT_MOUNT_PROCESS_UPDATE)
    public async onMountProcessUpdate(mount: Mount, status: MountStatus, progress: MountProgress) {
        this.setProgressInfoAndEmit(mount, progress, status);
    }

}

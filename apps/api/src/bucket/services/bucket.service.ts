import os from "os"
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Page, Pageable } from 'nestjs-pager';
import { Bucket } from '../entities/bucket.entity';
import { CreateBucketDTO } from '../dto/create-bucket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileSystemService } from '../../filesystem/services/filesystem.service';
import { Random } from "@tsalliance/utilities";

@Injectable()
export class BucketService {

    constructor(
        private readonly fileSystem: FileSystemService,
        @InjectRepository(Bucket) private readonly repository: Repository<Bucket>,
    ){}

    /**
     * Find a page of buckets.
     * @param pageable Page settings
     * @returns Page<Bucket>
     */
    public async findPage(pageable: Pageable): Promise<Page<Bucket>> {
        const query = await this.repository.createQueryBuilder("bucket")
            // Select the amount of mounts
            .loadRelationCountAndMap("bucket.mountsCount", "bucket.mounts", "mountsCount")
            // Get used space for every bucket by
            // summing up the used space of every
            // file on mounts inside the bucket.
            .leftJoin("bucket.mounts", "mount")
            .leftJoin("mount.files", "file")
            .addSelect("SUM(file.size) AS usedSpace")
            // Pagination
            .offset(pageable.page * pageable.size)
            .limit(pageable.size)
            .groupBy("bucket.id");

        const result = await query.getRawAndEntities();
        const totalElements = await query.getCount();
        return Page.of(result.entities.map((bucket, index) => {
            bucket.usedSpace = result.raw[index]?.usedSpace || 0;
            return bucket;
        }), totalElements, pageable.page);
    }

    /**
     * Find a bucket by its id.
     * @param bucketId Bucket's id
     * @returns Bucket
     */
    public async findById(bucketId: string): Promise<Bucket> {
        const result = await this.repository.createQueryBuilder("bucket")
            // Select the amount of mounts
            .loadRelationCountAndMap("bucket.mountsCount", "bucket.mounts", "mountsCount")
            // Get used space for every bucket by
            // summing up the used space of every
            // file on mounts inside the bucket.
            .leftJoin("bucket.mounts", "mount")
            .leftJoin("mount.files", "file")
            .addSelect("SUM(file.size) AS usedSpace")
            .groupBy("bucket.id")
            .where("bucket.id = :bucketId", { bucketId })
            .getRawAndEntities()

        const bucket = result.entities[0];
        if(!bucket) throw new NotFoundException("Bucket not found");
        
        bucket.usedSpace = result.raw[0].usedSpace;
        return bucket;
    }

    /**
     * Check if a bucket with name already exists.
     * @param name Name of the bucket
     * @returns True or False
     */
    public async existsByName(name: string): Promise<boolean> {
        return !!(await this.repository.findOne({ where: { name }}));
    }

    /**
     * Create new bucket providing a predefined id.
     * @param bucketId Predefined id
     * @param createBucketDto Bucket data
     * @returns Bucket
     */
    public async createWithId(bucketId: string, createBucketDto: CreateBucketDTO): Promise<Bucket> {
        return this.findById(bucketId).catch(async () => {
            // Finding bucket failed.
            // Proceed by checking if the name already exists
            if(await this.existsByName(createBucketDto.name)) {
                throw new BadRequestException("Bucket with that name already exists.");
            }
            
            return this.repository.save({
                ...createBucketDto,
                id: bucketId
            });   
        });
    }

    /**
     * Initialize local bucket. If the local instance has not yet
     * registered a bucket in the database, then a new one is created.
     * @returns {Bucket} Initialized bucket instance
     */
    public async initLocalBucket(): Promise<Bucket> {
        return this.createWithId(this.fileSystem.getInstanceId(), {
            name: `${os.hostname()}#${Random.randomString(4)}`
        })
    }



}

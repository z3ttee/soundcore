import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, Pageable } from 'nestjs-pager';
import { In, Repository } from 'typeorm';
import { Artwork } from '../../artwork/entities/artwork.entity';
import { SyncFlag } from '../../meilisearch/interfaces/syncable.interface';
import { MeiliPublisherService } from '../../meilisearch/services/meili-publisher.service';
import { CreateResult } from '../../utils/results/creation.result';
import { CreatePublisherDTO } from '../dtos/create-publisher.dto';
import { UpdatePublisherDTO } from '../dtos/update-publisher.dto';
import { Publisher } from '../entities/publisher.entity';

@Injectable()
export class PublisherService {
    private readonly logger: Logger = new Logger(PublisherService.name)

    constructor(
        @InjectRepository(Publisher) private readonly repository: Repository<Publisher>,
        private readonly meiliClient: MeiliPublisherService
    ){}

    /**
     * Find a publisher by its id.
     * @param publisherId Publisher's id
     * @returns Publisher
     */
     public async findById(publisherId: string): Promise<Publisher> {
        return this.repository.createQueryBuilder("publisher")
            .leftJoin("publisher.artwork", "artwork")
            .addSelect(["artwork.id"])
            .where("publisher.id = :publisherId", { publisherId })
            .getOne();
    }

    /**
     * Find a publisher by its name.
     * @param name Publisher's name
     * @returns Publisher
     */
    public async findByName(name: string): Promise<Publisher> {
        return this.repository.createQueryBuilder("publisher")
            .leftJoin("publisher.artwork", "artwork")
            .addSelect(["artwork.id"])
            .where("publisher.name = :name", { name })
            .getOne();
    }

    /**
     * Find a page of publishers by a specific sync flag.
     * @param flag Sync Flag
     * @param pageable Page settings
     * @returns Page<Publisher>
     */
    public async findBySyncFlag(flag: SyncFlag, pageable: Pageable): Promise<Page<Publisher>> {
        const result = await this.repository.createQueryBuilder("publisher")
            .leftJoin("publisher.artwork", "artwork").addSelect(["artwork.id"])
            .where("publisher.lastSyncFlag = :flag", { flag })
            .offset(pageable.page * pageable.size)
            .limit(pageable.size)
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.page);
    }

    /**
     * Save a publisher entity.
     * @param publisher Entity data to be saved
     * @returns Publisher
     */
    public async save(publisher: Publisher): Promise<Publisher> {
        return this.repository.save(publisher).then((result) => {
            this.sync([result]);
            return result;
        });
    }

    /**
     * Create new publisher by name if it does not already exist in the database.
     * @param createPublisherDto Publisher data to create
     * @returns Publisher
     */
    public async createIfNotExists(createPublisherDto: CreatePublisherDTO): Promise<CreateResult<Publisher>> {
        createPublisherDto.name = createPublisherDto.name?.trim();
        createPublisherDto.description = createPublisherDto.description?.trim();

        const existingPublisher = await this.findByName(createPublisherDto.name);
        if(existingPublisher) return new CreateResult(existingPublisher, true); 

        const publisher = this.repository.create();
        publisher.name = createPublisherDto.name;
        publisher.geniusId = createPublisherDto.geniusId;
        publisher.description = createPublisherDto.description;

        return this.repository.createQueryBuilder()
            .insert()
            .values(publisher)
            .orIgnore()
            .execute().then((result) => {
                if(result.identifiers.length > 0) {
                    return new CreateResult(publisher, false);
                }
                return this.findByName(createPublisherDto.name).then((publisher) => new CreateResult(publisher, true));
            }).catch((error) => {
                this.logger.error(`Could not create database entry for publisher: ${error.message}`, error.stack);
                return null
            })
    }

    /**
     * Update a publisher.
     * @param publisherId Publisher's id
     * @param updateLabelDto Updated data.
     * @returns Publisher
     */
    public async update(publisherId: string, updatePublisherDto: UpdatePublisherDTO): Promise<Publisher> {
        updatePublisherDto.name = updatePublisherDto.name?.trim();
        updatePublisherDto.description = updatePublisherDto.description?.trim();

        const publisher = await this.findById(publisherId);
        if(!publisher) throw new NotFoundException("Publisher not found.");

        publisher.name = updatePublisherDto.name;
        publisher.geniusId = updatePublisherDto.geniusId;
        publisher.description = updatePublisherDto.description;

        return this.save(publisher);
    }

    /**
     * Delete a publisher by its id.
     * @param publisherId Publisher's id
     * @returns boolean
     */
    public async deleteById(publisherId: string): Promise<boolean> {
        return this.meiliClient.deletePublisher(publisherId).then(() => {
            return this.repository.delete({ id: publisherId }).then((value) => {
                return value.affected > 0;
            });
        });
    }

    /**
     * Set the artwork of a publisher.
     * @param idOrObject Publisher id or object
     * @param artwork Updated artwork
     * @returns Publisher
     */
    public async setArtwork(idOrObject: string | Publisher, artwork: Artwork): Promise<Publisher> {
        const publisher = await this.resolvePublisher(idOrObject);
        if(!publisher) throw new NotFoundException("Publisher not found.");

        publisher.artwork = artwork;
        return this.repository.save(publisher);
    }

    /**
     * Resolve a publisher by given id or object
     * @param idOrObject Publisher id or object
     * @returns Publisher
     */
    protected async resolvePublisher(idOrObject: string | Publisher): Promise<Publisher> {
        if(typeof idOrObject == "string") {
            return this.findById(idOrObject);
        }

        return idOrObject;
    }

    /**
     * Update the sync flag of a publisher.
     * @param resources Id or object of the publisher
     * @param flag Updated sync flag
     * @returns Publisher
     */
    private async setSyncFlags(resources: Publisher[], flag: SyncFlag) {
        const ids = resources.map((user) => user.id);

        return this.repository.createQueryBuilder()
            .update({
                lastSyncedAt: new Date(),
                lastSyncFlag: flag
            })
            .where({ id: In(ids) })
            .execute();
    }

    /**
     * Synchronize the corresponding document on meilisearch.
     * @param resource Publisher data
     * @returns Publisher
     */
    public async sync(resources: Publisher[]) {
        return this.meiliClient.setPublishers(resources).then(() => {
            return this.setSyncFlags(resources, SyncFlag.OK);
        }).catch(() => {
            return this.setSyncFlags(resources, SyncFlag.ERROR);
        });
    }

}

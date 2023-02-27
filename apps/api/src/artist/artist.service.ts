import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Slug } from '@tsalliance/utilities';
import { Page, BasePageable } from 'nestjs-pager';
import { ObjectLiteral, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { SyncFlag } from '../meilisearch/interfaces/syncable.interface';
import { MeiliArtistService } from '../meilisearch/services/meili-artist.service';
import { GeniusFlag, ResourceFlag } from '../utils/entities/resource';
import { CreateArtistDTO } from './dtos/create-artist.dto';
import { UpdateArtistDTO } from './dtos/update-artist.dto';
import { Artist } from './entities/artist.entity';

@Injectable()
export class ArtistService {
    private readonly logger: Logger = new Logger(ArtistService.name);

    constructor(
        @InjectRepository(Artist) private readonly repository: Repository<Artist>,
        private readonly meiliClient: MeiliArtistService,
    ){ }

    public getRepository() {
        return this.repository;
    }

    /**
     * Find an artist by its id.
     * @param artistId Artist's id
     * @returns Artist
     */
    public async findById(artistId: string): Promise<Artist> {
        return this.buildGeneralQuery("artist")
            .where("artist.id = :artistId OR artist.slug = :artistId", { artistId })
            .getOne();
    }

    /**
     * Find profile of an artist by its id.
     * This includes stats like streamCount
     * @param artistId Artist's id.
     * @returns Artist
     */
    public async findProfileById(artistId: string): Promise<Artist> {
        const rawAndEntities = await this.repository.createQueryBuilder("artist")
            .leftJoin("artist.songs", "song")
            .leftJoin("song.streams", "stream")
            .loadRelationCountAndMap("artist.albumCount", "artist.albums", "albumCount")
            .loadRelationCountAndMap("artist.songCount", "artist.songs", "songCount")
            .addSelect("COUNT(stream.id)", "streamCount")
            .where("artist.id = :artistId OR artist.slug = :artistId" , { artistId })
            .getRawAndEntities();      

        const result = rawAndEntities.entities[0];
        const streamCount = Number(rawAndEntities.raw[0]?.streamCount ?? 0);
              
        if(!!result) result.streamCount = streamCount;
        return result;
    }

    /**
     * Find an artist by its name.
     * @param name Name of the artist.
     * @returns Artist
     */
    public async findByName(name: string): Promise<Artist> {
        return await this.repository.findOne({ where: { name }});
    }

    /**
     * Check if an artist exists by a name.
     * @param name Name of the artist.
     * @returns True or false
     */
    public async existsByName(name: string): Promise<boolean> {
        return !!(await this.repository.findOne({ where: { name }}));
    }

    /**
     * Count how many entities have a specific
     * flag set while syncing with meilisearch.
     * @param flag SyncFlag
     * @returns number
     */
    public async countBySyncFlag(flag: SyncFlag): Promise<number> {
        return this.repository.count({ where: { lastSyncFlag: flag } });
    }

    /**
     * Find a page of artists by a specific sync flag.
     * @param flag Sync Flag
     * @param pageable Page settings
     * @returns Page<Artist>
     */
    public async findBySyncFlag(flag: SyncFlag, pageable: BasePageable): Promise<Page<Artist>> {
        const result = await this.repository.createQueryBuilder("artist")
            .leftJoinAndSelect("artist.artwork", "artwork")
            .where("artist.lastSyncFlag = :flag", { flag })
            // Here we can safely use offset/limit, because artwork is no array
            // and therefor no extra rows are returned in the selection table.
            .offset(pageable.offset)
            .limit(pageable.limit)
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.offset);
    }

    /**
     * Save an artist entity.
     * @param artist Entity data to be saved
     * @returns Artist
     */
    public async save(artist: Artist): Promise<Artist> {
        return this.repository.save(artist).then((result) => {
            this.sync([result]);
            return result;
        });
    }

    public async findByIds(ids: ObjectLiteral): Promise<Artist[]> {
        return this.repository.createQueryBuilder()
            .whereInIds(ids)
            .getManyAndCount().then(([artists, count]) => {
                return artists;
            })
    }

    /**
     * Create artists if not exists.
     * @param dtos Data to create artists from
     * @param qb Define a custom select query for returning created items
     * @returns Artist[]
     */
    public async createIfNotExists(dtos: (CreateArtistDTO | Artist)[], qb?: (query: SelectQueryBuilder<Artist>, alias: string) => SelectQueryBuilder<Artist>): Promise<Artist[]> {
        if(dtos.length <= 0) throw new BadRequestException("Cannot create resources for empty list.");

        return await this.repository.createQueryBuilder()
            .insert()
            .values(dtos)
            .orUpdate(["name"], ["id"], { skipUpdateIfNoValuesChanged: false })
            .returning(["id"])
            .execute().then((insertResult) => {
                const alias = "artist";
                let query: SelectQueryBuilder<Artist> = this.repository.createQueryBuilder(alias).leftJoin(`${alias}.artwork`, "artwork").addSelect(["artwork.id"]);

                if(typeof qb === "function") {
                    query = qb(this.repository.createQueryBuilder(alias), alias);
                }
                    
                return query.whereInIds(insertResult.raw).getMany();
            });
    }

    /**
     * Update an artist by its id.
     * @param artistId Artist's id
     * @param updateArtistDto Updated artist data
     * @returns Artist
     */
    public async updateArtist(artistId: string, updateArtistDto: UpdateArtistDTO): Promise<Artist> {
        updateArtistDto.name = updateArtistDto.name?.trim();
        updateArtistDto.description = updateArtistDto.description?.trim();

        const artist = await this.findById(artistId);
        if(!artist) throw new NotFoundException("Artist not found.");
        if(await this.findByName(updateArtistDto.name)) throw new BadRequestException("Artist with that name already exists.");

        artist.name = updateArtistDto.name;
        artist.description = updateArtistDto.description;
        artist.slug = Slug.create(artist.name);

        return this.save(artist);
    }

    /**
     * Delete an artist by its id.
     * @param artistId Artist's id
     * @returns True or False
     */
    public async deleteById(artistId: string): Promise<boolean> {
        return this.meiliClient.deleteArtist(artistId).then(() => {
            return this.repository.delete({ id: artistId }).then((result) => {
                return result.affected > 0;
            });
        });
    }

    /**
     * Set resource flag of an artist.
     * @param idOrObject Artist id or object
     * @param flag Resource flag
     * @returns Artist
     */
    public async setFlag(idOrObject: string | Artist, flag: ResourceFlag): Promise<Artist> {
        const artist = await this.resolveArtist(idOrObject);
        if(!artist) return null;

        artist.flag = flag;
        return this.repository.save(artist);
    }

    /**
     * Set resource flag of an artist.
     * @param idOrObject Artist id or object
     * @param flag Genius flag
     * @returns Artist
     */
    public async setGeniusFlag(idOrObject: string | Artist, flag: GeniusFlag): Promise<Artist> {
        const artist = await this.resolveArtist(idOrObject);
        if(!artist) return null;

        artist.geniusFlag = flag;
        return this.repository.save(artist);
    }

    /**
     * Resolve an id or object to an artist object.
     * @param idOrObject Artist id or object
     * @returns Artist
     */
    protected async resolveArtist(idOrObject: string | Artist): Promise<Artist> {
        if(typeof idOrObject == "string") {
            return this.findById(idOrObject);
        }

        return idOrObject;
    }

    /**
     * Update the last synced attributes on songs.
     * This will update the lastSyncedAt and lastSyncedFlag attributes.
     * @param songs List of songs which should be affected by the change
     * @param flag Flag to set for all songs
     * @returns UpdateResult
     */
    public async setLastSyncedDetails(resources: Artist[], flag: SyncFlag): Promise<UpdateResult> {
        return this.repository.createQueryBuilder()
            .update()
            .set({ lastSyncedAt: new Date(), lastSyncFlag: flag })
            .whereInIds(resources)
            .execute();
    }

    /**
     * Synchronize the corresponding document on meilisearch.
     * @param resource Artist data
     * @returns Artist
     */
    public async sync(resources: Artist[]) {
        return this.meiliClient.setArtists(resources).then(() => {
            return this.setLastSyncedDetails(resources, SyncFlag.OK);
        }).catch(() => {
            return this.setLastSyncedDetails(resources, SyncFlag.ERROR);
        });
    }

    /**
     * Build general query. This includes relations for
     * artwork ...
     * @param alias Query alias for the artist.
     * @returns SelectQueryBuilder
     */
    private buildGeneralQuery(alias: string): SelectQueryBuilder<Artist> {
        return this.repository.createQueryBuilder(alias)
            .leftJoinAndSelect(`${alias}.artwork`, "artwork")

            .loadRelationCountAndMap(`${alias}.songsCount`, `${alias}.songs`)
            .loadRelationCountAndMap(`${alias}.albumsCount`, `${alias}.albums`)

            .leftJoin(`${alias}.songs`, "song")
            .loadRelationCountAndMap(`${alias}.streamCount`, "song.streams", "streamCount")
    }

}

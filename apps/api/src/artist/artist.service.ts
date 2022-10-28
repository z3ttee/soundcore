import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Environment } from '@soundcore/common';
import { Page, Pageable } from 'nestjs-pager';
import { In, ObjectLiteral, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
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
        const result = await this.repository.createQueryBuilder("artist")
            .leftJoin("artist.songs", "song")
            .leftJoin("song.streams", "stream")
            .addSelect("SUM(stream.streamCount) as artist_streamCount")
            .groupBy("artist.id")
            .where("artist.id = :artistId OR artist.slug = :artistId" , { artistId })
            .getOne();      
                    
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
    public async findBySyncFlag(flag: SyncFlag, pageable: Pageable): Promise<Page<Artist>> {
        const result = await this.repository.createQueryBuilder("artist")
            .leftJoinAndSelect("artist.artwork", "artwork")
            .where("artist.lastSyncFlag = :flag", { flag })
            // Here we can safely use offset/limit, because artwork is no array
            // and therefor no extra rows are returned in the selection table.
            .offset(pageable.page * pageable.size)
            .limit(pageable.size)
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.page);
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
                console.log(count);
                return artists;
            })
    }

    /**
     * Create an artist if not exists.
     * @param createArtistDto Data to create artist from
     * @returns Artist
     */
    public async createIfNotExists(dtos: CreateArtistDTO[]): Promise<Artist[]> {
        if(dtos.length <= 0) throw new BadRequestException("Cannot create resources for empty list.");

        return await this.repository.createQueryBuilder()
            .insert()
            .values(dtos)
            .returning(["id"])
            .orUpdate(["name"], ["name"], { skipUpdateIfNoValuesChanged: false })
            .execute().then((insertResult) => {
                return this.repository.createQueryBuilder("artist")
                    .leftJoinAndSelect("artist.artwork", "artwork")
                    .whereInIds(insertResult.raw)
                    .getMany();
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
    }

}

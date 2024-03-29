import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, Pageable } from '@soundcore/common';
import { Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { Artist } from '../../artist/entities/artist.entity';
import { EVENT_ALBUMS_CHANGED } from '../../constants';
import { User } from '../../user/entities/user.entity';
import { GeniusFlag } from '../../utils/entities/genius.entity';
import { MeilisearchFlag } from '../../utils/entities/meilisearch.entity';
import { ResourceFlag } from '../../utils/entities/resource';
import { SyncableService } from '../../utils/services/syncing.service';
import { CreateAlbumDTO } from '../dto/create-album.dto';
import { UpdateAlbumDTO } from '../dto/update-album.dto';
import { Album } from '../entities/album.entity';

@Injectable()
export class AlbumService implements SyncableService<Album> {
    private readonly logger: Logger = new Logger(AlbumService.name);

    constructor(
        @InjectRepository(Album) private readonly repository: Repository<Album>,
        private readonly eventEmitter: EventEmitter2
    ) { }

    /**
     * Find album by its id including all information required to display the album
     * page on the frontend
     * @param albumId Album's id
     * @returns Album
     */
     public async findById(albumId: string, authentication?: User): Promise<Album> {
        const result = await this.buildGeneralQuery("album", authentication)
            .loadRelationCountAndMap("album.songsCount", "album.songs")

            .leftJoin("album.distributors", "distributor").leftJoin("distributor.artwork", "da").addSelect(["distributor.id", "distributor.slug", "distributor.name", "da.id"])
            .leftJoin("album.publishers", "publisher").leftJoin("publisher.artwork", "pa").addSelect(["publisher.id", "publisher.slug", "publisher.name", "pa.id"])
            .leftJoin("album.labels", "label").leftJoin("label.artwork", "la").addSelect(["label.id", "label.slug", "label.name", "la.id"])
            .leftJoin("primaryArtist.artwork", "artistArtwork").addSelect(["artistArtwork.id"])
            .leftJoin("album.songs", "song").addSelect('SUM(song.duration) as album_totalDuration')
            
            .groupBy("album.id")
            .where("album.id = :albumId OR album.slug = :albumId", { albumId })
            .getOne();

        return result;
    }

    /**
     * Find albums by an artist
     * @param artistId Artist's id
     * @param pageable Page settings
     * @param authentication Authentication object
     * @returns Page<Album>
     */
    public async findByArtist(artistId: string, pageable: Pageable, authentication?: User): Promise<Page<Album>> {
        const result = await this.buildGeneralQuery("album", authentication)
            .skip(pageable.offset)
            .take(pageable.limit)

            .orderBy("album.releasedAt", "DESC")
            .addOrderBy("album.createdAt", "DESC")

            .where("primaryArtist.id = :artistId OR primaryArtist.slug = :artistId", { artistId })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable);
    }

    /**
     * Find albums where a special artist is featured in.
     * This looksup songs where the artist might be primary or featured artist
     * inside an album.
     * @param artistId Artist's id
     * @param pageable Page settings
     * @param authentication Authentication object
     * @returns Page<Album>
     */
    public async findFeaturedWithArtist(artistId: string, pageable: Pageable, authentication?: User): Promise<Page<Album>> {
        const result = await this.buildGeneralQuery("album", authentication)
            .leftJoin("album.songs", "song")
            .leftJoin("song.primaryArtist", "songArtist")
            .leftJoin("song.featuredArtists", "songFeatArtist")

            .skip(pageable.offset)
            .take(pageable.limit)

            .orderBy("album.releasedAt", "DESC")
            .addOrderBy("album.createdAt", "DESC")

            .where("primaryArtist.id != :artistId AND primaryArtist.slug != :artistId", { artistId })
            .andWhere("(songArtist.id = :artistId OR songArtist.slug = :artistId OR songFeatArtist.id = :artistId OR songFeatArtist.slug = :artistId)", { artistId })
            .getManyAndCount();
        
        return Page.of(result[0], result[1], pageable);
    }

    /**
     * Find 10 recommendation of albums by an artist.
     * @param artistId Artist's id
     * @param exceptAlbumIds Exclude album ids
     * @param authentication Authentication object
     * @returns Page<Album>
     */
    public async findRecommendedProfilesByArtist(artistId: string, exceptAlbumIds: string | string[] = [], authentication?: User): Promise<Page<Album>> {
        const maxAlbums = 8;
        if(!exceptAlbumIds) exceptAlbumIds = []
        if(!Array.isArray(exceptAlbumIds)) {
            exceptAlbumIds = [ exceptAlbumIds ];
        }

        const result = await this.buildGeneralQuery("album", authentication)
            .take(maxAlbums)
            .where("album.id NOT IN(:except) AND (primaryArtist.id = :artistId OR primaryArtist.slug = :artistId)", { except: exceptAlbumIds, artistId })
            .getMany();

        return Page.of(result, maxAlbums);
    }

    /**
     * Find albums by song genres.
     * @param genreId Genre id
     * @param pageable Page settings
     * @param authentication Authentication Object
     * @returns Page<Album>
     */
    public async findByGenre(genreId: string, pageable: Pageable, authentication?: User): Promise<Page<Album>> {
        const result = await this.buildGeneralQuery("album", authentication)
            .leftJoin("album.songs", "song")
            .leftJoin("song.genres", "genre")

            .skip(pageable.offset)
            .take(pageable.limit)

            .where("genre.id = :genreId OR genre.slug = :genreId", { genreId })
            .getManyAndCount()

        return Page.of(result[0], result[1], pageable);
    }

    /**
     * Find an album by its titel that also has a specific primary artist.
     * @param name name of the album to lookup
     * @param primaryArtist Primary album artist
     * @returns Album
     */
    public async findByNameAndArtist(name: string, primaryArtist: Artist): Promise<Album> {
        return await this.repository.createQueryBuilder("album")
            .leftJoinAndSelect("album.primaryArtist", "primaryArtist")
            .where("album.name = :name AND primaryArtist.id = :primaryArtistId", { name, primaryArtistId: primaryArtist?.id })
            .getOne();
    }

    /**
     * Find a page of albums by a specific sync flag.
     * @param flag Sync Flag
     * @param pageable Page settings
     * @returns Page<Album>
     */
    public async findBySyncFlag(flag: MeilisearchFlag, pageable: Pageable): Promise<Page<Album>> {
        const result = await this.repository.createQueryBuilder("album")
            .leftJoinAndSelect("album.artwork", "artwork")
            .leftJoinAndSelect("album.primaryArtist", "primaryArtist")
            .where("album.lastSyncFlag = :flag", { flag })
            // Here we can safely use offset/limit, because artwork is no array
            // and therefor no extra rows are returned in the selection table.
            .offset(pageable.offset)
            .limit(pageable.limit)
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable);
    }

    /**
     * Save an album entity.
     * @param album Entity data to be saved
     * @returns Album
     */
    public async save(album: Album): Promise<Album> {
        return this.repository.save(album).then((result) => {
            this.syncWithMeilisearch([result]);
            return result;
        });
    }

    /**
     * Create albums if not exists.
     * @param dtos Data to create albums from
     * @param qb Define a custom select query for returning created items
     * @returns Album[]
     */
    public async createIfNotExists(dtos: (CreateAlbumDTO | Album)[], qb?: (query: SelectQueryBuilder<Album>, alias: string) => SelectQueryBuilder<Album> ): Promise<Album[]> {
        if(dtos.length <= 0) throw new BadRequestException("Cannot create resources for empty list.");

        return await this.repository.createQueryBuilder()
            .insert()
            .values(dtos)
            .orUpdate(["name", "primaryArtistId"], ["id"], { skipUpdateIfNoValuesChanged: false })
            .returning(["id"])
            .execute().then((insertResult) => {
                const alias = "album";
                let query: SelectQueryBuilder<Album> = this.repository.createQueryBuilder(alias)
                    .leftJoin(`${alias}.artwork`, "artwork").addSelect(["artwork.id"])
                    .leftJoin(`${alias}.primaryArtist`, "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.name", "primaryArtist.slug"]);

                if(typeof qb === "function") {
                    query = qb(this.repository.createQueryBuilder(alias), alias);
                }
                    
                return query.whereInIds(insertResult.raw).getMany();
            });
    }
    /**
     * Update an existing album.
     * @param albumId Album's id
     * @param updateAlbumDto Updated album data
     * @returns Album
     */
    public async update(albumId: string, updateAlbumDto: UpdateAlbumDTO): Promise<Album> {
        updateAlbumDto.name = updateAlbumDto.name?.trim();
        updateAlbumDto.description = updateAlbumDto.description?.trim();
        if(!updateAlbumDto.primaryArtist) throw new BadRequestException("Creating album without primary artist is not allowed.");

        const album = await this.resolveAlbum(albumId);
        if(!album) throw new NotFoundException("Album not found");

        album.name = updateAlbumDto.name;
        album.primaryArtist = updateAlbumDto.primaryArtist;
        album.description = updateAlbumDto.description;
        album.releasedAt = updateAlbumDto.releasedAt;
        
        return this.save(album).then((result) => {
            // Emit changed event to proceed with automatic genius lookup
            if(updateAlbumDto.lookupGenius) this.eventEmitter.emit(EVENT_ALBUMS_CHANGED, album);
            return result;
        })
    }

    /**
     * Set the primary artist of an album.
     * @param idOrObject Id or album object
     * @param primaryArtist Updated primary artist
     * @returns Album
     */
    public async setPrimaryArtist(idOrObject: string | Album, primaryArtist: Artist): Promise<Album> {
        const album = await this.resolveAlbum(idOrObject);
        if(!album) throw new NotFoundException("Album not found.");

        album.primaryArtist = primaryArtist;
        return this.repository.save(album);
    }

    /**
     * Set resource flag of an Album.
     * @param idOrObject Album id or object
     * @param flag Genius flag
     * @returns Album
     */
    public async setGeniusFlag(idOrObject: string | Album, flag: GeniusFlag): Promise<Album> {
        const album = await this.resolveAlbum(idOrObject);
        if(!album) throw new NotFoundException("Album not found.");

        album.genius.flag = flag;
        return this.repository.save(album);
    }

    /**
     * Update the last synced attributes on songs.
     * This will update the lastSyncedAt and lastSyncedFlag attributes.
     * @param songs List of songs which should be affected by the change
     * @param flag Flag to set for all songs
     * @returns UpdateResult
     */
    public async setLastSyncedDetails(resources: Album[], flag: MeilisearchFlag): Promise<UpdateResult> {
        return this.repository.createQueryBuilder()
            .update()
            .set({ 
                meilisearch: {
                    syncedAt: new Date(), 
                    flag: flag
                }
            })
            .whereInIds(resources)
            .execute();
    }

    /**
     * Synchronize the corresponding document on meilisearch.
     * @param resource Album data
     * @returns Album
     */
    public async syncWithMeilisearch(resources: Album[]) {
        // return this.meilisearch.setAlbums(resources).then(() => {
        //     return this.setLastSyncedDetails(resources, MeilisearchFlag.OK);
        // }).catch(() => {
        //     return this.setLastSyncedDetails(resources, MeilisearchFlag.FAILED);
        // });

        return null;
    }

    /**
     * Find album by its id or object itself.
     * @param idOrObject Id or album object
     * @returns Album
     */
    private async resolveAlbum(idOrObject: string | Album): Promise<Album> {
        if(typeof idOrObject == "string") {
            return this.findById(idOrObject);
        }

        return idOrObject;
    }

    private buildGeneralQuery(alias: string, authentication?: User): SelectQueryBuilder<Album> {
        return this.repository.createQueryBuilder(alias)
            .leftJoin(`${alias}.artwork`, "artwork").addSelect(["artwork.id", "artwork.accentColor"])
            .leftJoin(`${alias}.primaryArtist`, "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .loadRelationCountAndMap(`${alias}.liked`, `${alias}.likedBy`, "likedBy", (qb) => qb.where("likedBy.userId = :userId", { userId: authentication?.id }))
    }    


    

}

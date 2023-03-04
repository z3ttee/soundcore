import fs from "node:fs";
import path from "node:path";
import NodeID3 from "node-id3";
import ffprobe from 'ffprobe';
import ffprobeStatic from "ffprobe-static";
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Page, BasePageable } from 'nestjs-pager';
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, SelectQueryBuilder, UpdateResult } from "typeorm";
import { Environment } from "@soundcore/common";
import { SyncableService } from "../../utils/services/syncing.service";
import { Song } from "../entities/song.entity";
import { MeiliSongService } from "../../meilisearch/services/meili-song.service";
import { User } from "../../user/entities/user.entity";
import { SyncFlag } from "../../meilisearch/interfaces/syncable.interface";
import { CreateSongDTO } from "../dtos/create-song.dto";
import { Artwork, SongArtwork } from "../../artwork/entities/artwork.entity";
import { GeniusFlag, ResourceFlag } from "../../utils/entities/resource";
import { ID3Artist, ID3TagsDTO } from "../dtos/id3-tags.dto";
import { SongUniqueFindDTO } from "../dtos/unique-find.dto";
import { FileFlag } from "../../file/entities/file.entity";

@Injectable()
export class SongService implements SyncableService<Song> {
    private readonly logger: Logger = new Logger(SongService.name)

    constructor(
        @InjectRepository(Song) private readonly repository: Repository<Song>,
        private readonly meilisearch: MeiliSongService
    ){}

    /**
     * Find page with the 20 latest indexed songs.
     * @param authentication Authentication object. Used for checking if a user has liked a song
     * @returns Page<Song>
     */
    public async findLatestPage(authentication?: User): Promise<Page<Song>> {
        const result = await this.buildGeneralQuery("song", authentication)
            .orderBy("song.released", "DESC")
            .addOrderBy("song.createdAt", "DESC")
            .limit(20)
            .getMany();

        return Page.of(result, result.length, 0);
    }

    /**
     * Find page with the oldest songs by their actual release date
     * @param authentication Authentication object. Used for checking if a user has liked a song
     * @returns Page<Song>
     */
    public async findOldestReleasePage(authentication?: User): Promise<Page<Song>> {
        const result = await this.buildGeneralQuery("song", authentication)
            .orderBy("song.released", "ASC")
            .addOrderBy("song.createdAt", "ASC")
            .limit(20)
            .getMany();

        return Page.of(result, result.length, 0);
    }

    /**
     * Find song by its id.
     * @param songId Song's id
     * @param availableOnly Include only songs that are available or all
     * @param authentication Authentication object. Used for checking if a user has liked a song
     * @returns Song
     */
    public async findById(songId: string, availableOnly: boolean, authentication?: User): Promise<Song> {
        const query = availableOnly ? this.buildAvailableOnlyQuery("song", authentication) : this.buildGeneralQuery("song", authentication);
        const result = await query
            .leftJoin("song.labels", "label").addSelect(["label.id", "label.slug", "label.name"]).leftJoin("label.artwork", "labelArtwork").addSelect(["labelArtwork.id"])
            .leftJoin("song.publishers", "publisher").addSelect(["publisher.id", "publisher.slug", "publisher.name"]).leftJoin("publisher.artwork", "publisherArtwork").addSelect(["publisherArtwork.id"])
            .leftJoin("song.distributors", "distributor").addSelect(["distributor.id", "distributor.slug", "distributor.name"]).leftJoin("distributor.artwork", "distributorArtwork").addSelect(["distributorArtwork.id"])
            .leftJoin("song.genres", "genre").addSelect(["genre.id", "genre.slug", "genre.name"]).leftJoin("genre.artwork", "genreArtwork").addSelect(["genreArtwork.id"])
            .andWhere("song.id = :songId OR song.slug = :songId", { songId })
            .getOne();

        return result;
    }

    public async findByNamesAndArtistsAndAlbums(names: string[], artistNames: string[], albumNames: string[]): Promise<Song[]> {
        return await this.repository.createQueryBuilder("song")
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtist").addSelect(["featuredArtist.id", "featuredArtist.slug", "featuredArtist.name"])
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id"])
            .where("song.name IN(:names) AND album.name IN(:albumNames) AND (primaryArtist.name IN(:artistNames) OR featuredArtist.name IN(:artistNames))", { names, artistNames, albumNames })
            .getMany();
    }

    public async findByArtworkIds(artworkIds: string[]): Promise<Song[]> {
        return await this.repository.createQueryBuilder("song")
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtist").addSelect(["featuredArtist.id", "featuredArtist.slug", "featuredArtist.name"])
            .leftJoinAndSelect("song.artwork", "artwork")
            .leftJoinAndSelect("song.file", "file")
            .leftJoinAndSelect("file.mount", "mount")
            .groupBy("artwork.id")
            .distinct(true)
            .where("artwork.id IN (:artworkIds)", { artworkIds })
            .getMany();
    }

    /**
     * Find a song including its artwork relation.
     * This function is especially used for finding songs in a playlist.
     * @param songId Id of the song
     * @param authentication Authentication object. Used for checking if a user has liked a song
     * @returns Song
     */
    public async findByIdWithArtwork(songId: string, authentication?: User): Promise<Song> {
        return this.buildGeneralQuery("song", authentication).andWhere("song.id = :songId OR song.slug = :songId", { songId }).getOne();
    }

    /**
     * Find a song that matches a certain title and belongs to specific primaryArtist and
     * featuredArtists. This does not replace a propery search function but helps when it
     * comes to importing songs from other platforms. For that, songs can be easily compared
     * and put into relation.
     * @param title Title of a song
     * @param artists Names of artists
     * @param authentication Authentication object. Used for checking if a user has liked a song
     * @returns Song
     */
    public async findByTitleAndArtists(title: string, artists: string[], authentication?: User): Promise<Song> {
        return await this.buildGeneralQuery("song", authentication)
            .where("song.title = :title AND (primaryArtist.name IN(:artists) OR featuredArtist.name IN(:artists))", { title, artists })
            .getOne();
    }

    /**
     * Find page of songs for a genre (and if defined: for an artist in that genre).
     * @param genreId Genre's id
     * @param artistId Artist's id, if you want to get songs of the artist out of that genre.
     * @param pageable Page settings
     * @param authentication User authentication object
     * @returns Page<Song>
     */
    public async findByGenreAndOrArtist(genreId: string, artistId: string, pageable?: BasePageable, authentication?: User): Promise<Page<Song>> {
        const query = this.buildGeneralQuery("song", authentication)
            .leftJoin("song.genres", "genre")
            // Pagination
            .skip(pageable.offset)
            .take(pageable.limit)
            .where("(primaryArtist.id = :artistId OR artist.slug = :artistId) AND (genre.id = :genreId OR genre.slug = :genreId)", { genreId, artistId });

        const result = await query.getManyAndCount();
        return Page.of(result[0], result[1], pageable.offset);
    }

    /**
     * Find page of songs out of a user's collection and, if defined, by an artist.
     * @param user User to fetch collection for.
     * @param pageable Page settings.
     * @param artistId Artist's id, to fetch songs from an artist that a user has in his collection.
     * @returns Page<Song>
     */
    public async findByCollectionAndOrArtist(user: User, pageable: BasePageable, artistId?: string): Promise<Page<Song>> {
        // TODO: Ignore indexes that are not OK
        // Fetch available elements
        let qb = await this.repository.createQueryBuilder('song')
            .leftJoin("song.likedBy", "likedBy")
            .leftJoin("song.index", "index")

            .leftJoin("song.albums", "album")
            .leftJoinAndSelect("song.artwork", "artwork")
            .leftJoin("song.artists", "artist")

            .addSelect(["index.id", "album.id", "album.title", "artist.id", "artist.name", "likedBy.likedAt"])
            
            .where("likedBy.userId = :userId", { userId: user?.id })

            .skip(pageable.offset)
            .take(pageable.limit)
            .orderBy("likedBy.likedAt", "DESC")
        
        // Take artistId into account if it exists
        if(artistId) qb = qb.andWhere("artist.id = :artistId", { artistId });

        // Count available elements
        let countQb = await this.repository.createQueryBuilder("song")
            .leftJoin("song.likedBy", "likedBy")
            .leftJoin("song.index", "index")

            .where("likedBy.userId = :userId", { userId: user?.id })

        // Take artistId into account if it exists
        if(artistId) countQb = countQb.leftJoin("song.artists", "artist").andWhere("artist.id = :artistId", { artistId });
            
        const totalElements = await countQb.getCount();

        // Execute fetch query
        const result = await qb.getRawAndEntities();

        return Page.of(result.entities.map((s) => {
            s.liked = true
            return s;
        }), totalElements);
    }

    /**
     * Find page of songs out of a user's collection and, if defined, by an artist.
     * @param user User to fetch collection for.
     * @param pageable Page settings.
     * @param artistId Artist's id, to fetch songs from an artist that a user has in his collection.
     * @returns Page<Song>
     */
    public async findIdsByCollection(user: User, artistId?: string): Promise<Page<Song>> {
        // Fetch available elements
        let qb = this.repository.createQueryBuilder('song')
            .leftJoin("song.index", "index")
            .leftJoin("song.likedBy", "likedBy")
            .where("likedBy.userId = :userId", { userId: user?.id })
            .orderBy("likedBy.likedAt", "DESC")
            .select(["song.id"])
            
        if(artistId) qb = qb.leftJoin("song.artists", "artist").andWhere("artist.id = :artistId", { artistId })
        const result = await qb.getManyAndCount();
        return Page.of(result[0], result[1], 0)
    }

    public async findCoverSongsInPlaylist(playlistId: string): Promise<Page<Song>> {
        const qb = this.repository.createQueryBuilder("song")
            .leftJoinAndSelect("song.artwork", "artwork")
            .leftJoin("song.playlists", "item")
            .leftJoin("item.playlist", "playlist")
            .leftJoin("song.index", "index")

            .orderBy("item.order", "ASC")
            .addOrderBy("item.createdAt", "ASC")

            .where("playlist.id = :playlistId OR playlist.slug = :playlistId", { playlistId })
            .offset(0)
            .limit(4)

        const result = await qb.getManyAndCount();
        return Page.of(result[0], result[1], 0);
    }

    /**
     * Find a page of artists by a specific sync flag.
     * @param flag Sync Flag
     * @param pageable Page settings
     * @returns Page<Artist>
     */
    public async findBySyncFlag(flag: SyncFlag, pageable: BasePageable): Promise<Page<Song>> {
        const result = await this.repository.createQueryBuilder("song")
            .leftJoin("song.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("song.album", "album").addSelect(["album.id", "album.slug", "album.name"])
            .leftJoin("song.primaryArtist", "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
            .leftJoin("song.featuredArtists", "featuredArtists").addSelect(["featuredArtists.id", "featuredArtists.slug", "featuredArtists.name"])
            .leftJoin("song.genres", "genre").addSelect(["genre.id","genre.slug","genre.name"])

            .where("song.lastSyncFlag = :flag", { flag })
            
            .skip(pageable.offset)
            .take(pageable.limit)
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.offset);
    }

    /**
     * Create new song entry in database. If the same entry already exists,
     * the existing one will be returned.
     * Existing song contains following relations: primaryArtist, featuredArtist, album
     * @param createSongDto Song data to be saved
     * @returns Song[]
     */
    public async createIfNotExists(dtos: (CreateSongDTO | Song)[], qb?: (query: SelectQueryBuilder<Song>, alias: string) => SelectQueryBuilder<Song> ): Promise<Song[]> {
        if(dtos.length <= 0) throw new BadRequestException("Cannot create resources for empty list.");

        return await this.repository.createQueryBuilder()
            .insert()
            .values(dtos)
            .orUpdate(["name", "primaryArtistId", "albumId", "order", "duration", "fileId"], ["id"], { skipUpdateIfNoValuesChanged: false })
            .returning(["id"])
            .execute().then((insertResult) => {
                const alias = "song";
                let query: SelectQueryBuilder<Song> = this.repository.createQueryBuilder("song")
                    .leftJoinAndSelect("song.primaryArtist", "primaryArtist")
                    .leftJoinAndSelect("song.album", "album")
                    .leftJoinAndSelect("song.file", "file")
                    .leftJoinAndSelect("song.artwork", "artwork")

                if(typeof qb === "function") {
                    query = qb(this.repository.createQueryBuilder(alias), alias);
                }
                    
                return query.whereInIds(insertResult.raw).getMany();
            });
    }

    public async saveAll(songs: Song[]) {
        return this.repository.save(songs);
    }

    /**
     * Set the artwork of a song.
     * @param idOrObject Id or song object
     * @param artwork Artwork to set
     * @returns Song
     */
    public async setArtwork(idOrObject: string | Song, artwork: Artwork | SongArtwork): Promise<Song> {
        const song = await this.resolveSong(idOrObject);
        if(!song) throw new NotFoundException("Could not find song.");

        song.artwork = artwork as SongArtwork;
        return this.repository.save(song);
    }

    public async setArtworks(objects: (Pick<Song, "artwork"> & Pick<Song, "id">)[]): Promise<Song[]> {
        return this.repository.save(objects);
    }

    /**
     * Set the flag of a song.
     * @param idOrObject Id or song object
     * @param flag Flag to set
     * @returns Song
     */
    public async setFlag(idOrObject: string | Song, flag: ResourceFlag): Promise<Song> {
        const song = await this.resolveSong(idOrObject);
        if(!song) throw new NotFoundException("Could not find song.");

        song.flag = flag;
        return this.repository.save(song);
    }

    /**
     * Set the genius flag of a song.
     * @param idOrObject Id or song object
     * @param flag Genius Flag to set
     * @returns Song
     */
    public async setGeniusFlag(idOrObject: string | Song, flag: GeniusFlag): Promise<Song> {
        const song = await this.resolveSong(idOrObject);
        if(!song) throw new NotFoundException("Could not find song.");

        song.geniusFlag = flag;
        return this.repository.save(song);
    }

    /**
     * Update the sync flag of an artist.
     * @param idOrObject Id or object of the artist
     * @param flag Updated sync flag
     * @returns Song
     */
    private async setSyncFlags(resources: Song[], flag: SyncFlag) {
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
     * Update the last synced attributes on songs.
     * This will update the lastSyncedAt and lastSyncedFlag attributes.
     * @param songs List of songs which should be affected by the change
     * @param flag Flag to set for all songs
     * @returns UpdateResult
     */
    public async setLastSyncedDetails(songs: Song[], flag: SyncFlag): Promise<UpdateResult> {
        return this.repository.createQueryBuilder()
            .update()
            .set({ lastSyncedAt: new Date(), lastSyncFlag: flag })
            .whereInIds(songs)
            .execute();
    }

    /**
     * Synchronize the corresponding document on meilisearch.
     * @param resources Songs to sync
     * @returns UpdateResult
     */
    public async syncWithMeilisearch(resources: Song[]) {
        return this.meilisearch.setSongs(resources).then(() => {
            return this.setSyncFlags(resources, SyncFlag.OK);
        }).catch(() => {
            return this.setSyncFlags(resources, SyncFlag.ERROR);
        });
    }

    /**
     * Set the order in the song's album.
     * @param idOrObject Id or song object
     * @param order Updated album order number
     * @returns Song
     */
    public async setAlbumOrder(idOrObject: string | Song, order: number): Promise<Song> {
        const song = await this.resolveSong(idOrObject);
        if(!song) throw new NotFoundException("Could not find song.");

        song.order = order;
        return this.repository.save(song);
    }

    /**
     * Read ID3Tags from a mp3 file.
     * @param filepath Path to mp3 file
     * @returns ID3TagsDTO
     */
    public async readID3TagsFromFile(absolutePath: string): Promise<ID3TagsDTO> {
        const filepath = path.resolve(absolutePath);
        
        // Get duration in seconds
        const probe = await ffprobe(filepath, { path: ffprobeStatic.path });
        const durationInSeconds = Math.round(probe.streams[0].duration || 0);
        
        const id3Tags = NodeID3.read(fs.readFileSync(filepath));

        // Media file not a mp3 file, so return
        // at this point with some data from the file details
        if(!id3Tags) {
            return {
                album: undefined,
                artists: [],
                cover: undefined,
                orderNr: 0,
                filepath: filepath,
                title: path.basename(filepath).replace(/\.[^/.]+$/, "").trim(),
                duration: durationInSeconds
            }
        }

        const title = id3Tags.title?.trim() || path.basename(filepath).replace(/\.[^/.]+$/, "").trim();

        // Get artists
        const artists: ID3Artist[] = [];
        if (id3Tags.artist) {
            const splitted = id3Tags.artist.split(",") || [];

            for (const index in splitted) {
                artists.push({ name: splitted[index]?.trim() });
            }
        }

        if(artists.length <= 0) {
            if(Environment.isDebug) {
                this.logger.debug(`No artists found on file ${filepath}`);
            }
        }

        // Get artwork buffer
        let artworkBuffer: Buffer = undefined;
        if (id3Tags?.image && id3Tags.image["imageBuffer"]) {
            artworkBuffer = id3Tags.image["imageBuffer"]
        }

        // Build result DTO
        const result: ID3TagsDTO = {
            filepath,
            title: title,
            duration: durationInSeconds,
            artists: artists,
            album: id3Tags.album?.trim() ?? title,
            cover: artworkBuffer,
            orderNr: parseInt(id3Tags.trackNumber?.split("/")?.[0]) ?? 0
        }

        return result
    }

    /**
     * Resolve an id or object to song object.
     * @param idOrObject ID of the song or song object.
     * @returns Song
     */
    private async resolveSong(idOrObject: string | Song): Promise<Song> {
        if(typeof idOrObject == "string") {
            return this.findById(idOrObject, false);
        }

        return idOrObject as Song;
    }

    /**
     * Find a unique song for certain criterias that are usually used to prove
     * a songs uniqueness.
     * @param uniqueSong Data to prove uniqueness
     * @returns Song
     */
    private async findUniqueSong(uniqueSong: SongUniqueFindDTO): Promise<Song> {
        let query = this.repository.createQueryBuilder("song")
                .leftJoinAndSelect("song.primaryArtist", "primaryArtist")
                .leftJoinAndSelect("song.featuredArtists", "featuredArtist")
                .leftJoinAndSelect("song.album", "album")
                .where("song.name = :name AND album.name = :album AND song.duration = :duration AND primaryArtist.name = :artist", { 
                    name: uniqueSong.name,
                    duration: uniqueSong.duration,
                    album: uniqueSong.album?.name,
                    artist: uniqueSong.primaryArtist?.name
                });

            // Build query to include all featuredArtists in where clause
            const featuredArtists = uniqueSong.featuredArtists?.map((artist) => artist.name) || [];
            query = query.andWhere(`featuredArtist.name = '${featuredArtists.join("' OR featuredArtist.name = '")}'`);

            // Execute query.
            return query.getOne();
    }

    /**
     * Execute search query for a song. This looks up songs that match the query.
     * The search includes looking for songs with a specific artist's name.
     * @param query Query string
     * @param pageable Page settings
     * @returns Page<Song>
     */
    public async findBySearchQuery(query: string, pageable: BasePageable, authentication?: User): Promise<Page<Song>> {
        if(!query || query == "") {
            query = "%"
        } else {
            query = `%${query.replace(/\s/g, '%')}%`;
        }

        // TODO: Sort by "views"?

        // Find song by title or if the artist has similar name
        const q = this.buildGeneralQuery("song", authentication)
            .where("song.title LIKE :query", { query })
            .orWhere("artist.name LIKE :query", { query })

            .skip(pageable.offset)
            .take(pageable.limit)
            .orderBy("rand()");

        const result = await q.getManyAndCount();
        return Page.of(result[0], result[1], pageable.offset);
    }

    public getRepository(): Repository<Song> {
        return this.repository;
    }

    /**
     * Build a general query which includes different relations.
     * Relations included: Artwork, primaryArtist, featuredArtists, available bool, liked bool, album
     * @param alias Alias to choose for the querybuilder
     * @param authentication User authentication object for getting info on if the user has liked the song.
     * @returns SelectQueryBuilder<Song>
     */
    public buildGeneralQuery(alias: string, authentication?: User) {
        const queryBuilder = this.repository.createQueryBuilder(alias);
        
        // Fetch info if user has liked the song
        if(authentication) queryBuilder.loadRelationCountAndMap(`${alias}.liked`, `${alias}.likes`, "likes", (qb) => qb.where("likes.userId = :userId", { userId: authentication?.id }))

        // Add basic relations used everywhere
        queryBuilder.leftJoin(`${alias}.artwork`, "artwork").addSelect(["artwork.id"]);
        queryBuilder.leftJoin(`${alias}.primaryArtist`, "primaryArtist").addSelect(["primaryArtist.id", "primaryArtist.slug", "primaryArtist.name"])
        queryBuilder.leftJoin(`${alias}.featuredArtists`, "featuredArtist").addSelect(["featuredArtist.id", "featuredArtist.slug", "featuredArtist.name"])

        // Add album information
        queryBuilder.leftJoin(`${alias}.album`, "album").addSelect(["album.id", "album.slug", "album.name"])

        return queryBuilder;
    }

    private buildAvailableOnlyQuery(alias: string, authentication?: User) {
        return this.buildGeneralQuery(alias, authentication).leftJoin("song.file", "file").where("file.flag = :flag", { flag: FileFlag.OK });
    }

}

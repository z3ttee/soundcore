import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, Pageable, isNull } from '@soundcore/common';
import { Not, ObjectLiteral, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { Playlist } from '../entities/playlist.entity';
import { PlaylistItem } from '../entities/playlist-item.entity';
import { User } from '../../user/entities/user.entity';
import { PlaylistPrivacy } from '../enums/playlist-privacy.enum';
import { CreatePlaylistDTO } from '../dtos/create-playlist.dto';
import { AddSongDTO } from '../dtos/add-song.dto';
import { PlaylistAddSongFailReason, PlaylistItemAddResult } from '../entities/playlist-item-added.entity';
import { Song } from '../../song/entities/song.entity';
import { MeilisearchFlag } from '../../utils/entities/meilisearch.entity';
import { PlaylistMeiliService } from './playlist-meili.service';
import { Slug } from '@tsalliance/utilities';

@Injectable()
export class PlaylistService {
    
    constructor(
        @InjectRepository(Playlist) private playlistRepository: Repository<Playlist>,
        @InjectRepository(PlaylistItem) private song2playlistRepository: Repository<PlaylistItem>,
        private readonly meilisearch: PlaylistMeiliService
    ) {}

    /**
     * Find a playlist by its id
     * @param {string} playlistId Id of the playlist
     * @param {User} authentication Authentication object
     * @returns {Playlist}
     */
    public async findById(playlistId: string, authentication?: User): Promise<Playlist> {
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.author", "author").addSelect(["author.id", "author.slug", "author.name"])
            .leftJoin("playlist.artwork", "artwork").addSelect(["artwork.id"])
            .where("(playlist.id = :playlistId OR playlist.slug = :playlistId) AND (playlist.privacy IN(:privacy) OR author.id = :authorId)", { 
                playlistId: playlistId,
                privacy: [PlaylistPrivacy.PUBLIC, PlaylistPrivacy.NOT_LISTED].join(","),
                authorId: authentication?.id
            })
            .getOne();

        return result;
    }

    /**
     * Find playlists by multiple ids
     * @param {string} ids Ids of the playlists
     * @returns {Playlist}
     */
    public async findInIds(ids: ObjectLiteral[]): Promise<Playlist[]> {
        return this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.author", "author").addSelect(["author.id", "author.slug", "author.name"])
            .leftJoin("playlist.artwork", "artwork").addSelect(["artwork.id"])
            .whereInIds(ids)
            .getMany();
    }

    /**
     * Find public playlists by an author.
     * @param authorId Author to lookup playlists for
     * @param pageable Page settings
     * @param authentication User authentication object to check playlist access
     * @returns Page<Playlist>
     */
    public async findByAuthor(authorId: string, pageable: Pageable, authentication: User): Promise<Page<Playlist>> {        
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.author", "author").addSelect(["author.id", "author.name", "author.slug"])
            .leftJoin("playlist.artwork", "artwork").addSelect(["artwork.id"])
            .leftJoin("playlist.likedBy", "likedByUser")

            // Pagination
            .limit(pageable.limit)
            .offset(pageable.offset)

            // Count how many likes. This takes user's id in count
            .loadRelationCountAndMap("playlist.liked", "playlist.likedBy", "likedBy", (qb) => qb.where("likedBy.userId = :userId", { userId: authentication.id }))

            .where("playlist.privacy = '" + PlaylistPrivacy.PUBLIC.toString() + "' AND (author.id = :authorId OR author.slug = :authorId) OR (likedByUser.userId = :userId AND playlist.privacy = :privacy)", { authorId: authorId, privacy: PlaylistPrivacy.NOT_LISTED.toString(), userId: authentication.id })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable);
    }

    /**
     * Check if a playlist already contains a song.
     * @param playlistId Playlist's id
     * @param songId Song's id
     * @returns True or False
     */
    public async containsSong(playlistId: string, songId: string): Promise<boolean> {
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.items", "item")
            .leftJoin("item.song", "song")

            .where("song.id = :songId AND (playlist.id = :playlistId OR playlist.slug = :playlistId)", { songId, playlistId })
            .select(["playlist.id"])
            .getOne();

        return !!result;
    }

    /**
     * Find all playlists that belong to an authenticated user.
     * This includes all authored playlists as well as liked and
     * collaborative playlists of others.
     * @param {User} authentication Authentication object
     * @returns {Page} Page<Playlist>
     */
    public async findAllByAuthenticatedUser(authentication: User): Promise<Page<Playlist>> {
        const result = await this.buildGeneralQuery("playlist", authentication)
            .leftJoin("playlist.likedBy", "likedBy")
            .leftJoin("likedBy.user", "likedByUser")

            .where("author.id = :authorId OR (likedByUser.id = :userId AND playlist.privacy != :privacy)", { authorId: authentication.id, privacy: PlaylistPrivacy.PRIVATE, userId: authentication.id })
            // .orWhere("collaborator.id = :userId", { userId: authentication.id })
            // .orWhere("likedByUser.id = :userId", { userId: authentication.id })
            // .andWhere("playlist.privacy != :privacy", { privacy: PlaylistPrivacy.PRIVATE })
            .getManyAndCount();

        return Page.of(result[0], result[1]);
    }

    

    public async findByArtist(artistId: string, pageable: Pageable, authentication: User): Promise<Page<Playlist>> {
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.items", "item")
            .leftJoin("item.song", "song")
            .leftJoin("song.primaryArtist", "primaryArtist")
            .leftJoin("song.featuredArtists", "featuredArtist")

            .leftJoinAndSelect("playlist.author", "author")
            .leftJoinAndSelect("playlist.artwork", "artwork")
            .leftJoin("playlist.likedBy", "likedByUser", "likedByUser.userId = :userId", { userId: authentication.id })

            // Pagination
            .limit(pageable.limit)
            .offset(pageable.offset)

            // Count how many likes. This takes user's id in count
            .loadRelationCountAndMap("playlist.liked", "playlist.likedBy", "likedBy", (qb) => qb.where("likedBy.userId = :userId", { userId: authentication.id }))

            // .where("(primaryArtist.id = :primaryArtistId OR primaryArtist.slug = :primaryArtistId) AND (playlist.privacy = :privacy OR author.id = :authorId OR collaborator.id = :authorId OR (likedByUser.userId = :authorId AND playlist.privacy != 'private'))", { artistId: artistId, privacy: PlaylistPrivacy.PUBLIC.toString(), authorId: authentication.id })
            .where("primaryArtist.id = :primaryArtistId OR primaryArtist.slug = :primaryArtistId OR featuredArtist.id = :featuredArtistId OR featuredArtist.slug = :featuredArtistId", { primaryArtistId: artistId, featuredArtistId: artistId })
            .andWhere("(author.id = :authorId OR author.slug = :authorId OR playlist.privacy = :privacy)", { authorId: authentication?.id, privacy: PlaylistPrivacy.PUBLIC.toString() })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable);
    }

    /**
     * Check if the user already has a playlist with a specific name.
     * You can define a playlistId to exclude. The intentional use case is to check for
     * other playlists but not the current one which will be updated.
     * @param name Playlist's name 
     * @param userId Author's id
     * @param playlistId Playlist to exclude from lookup
     * @returns True or False
     */
    public async existsByNameAndUser(name: string, userId: string, playlistId?: string): Promise<boolean> {
        if(playlistId) return !! (await this.playlistRepository.findOne({ where: { name: name, author: { id: userId }, id: Not(playlistId)}, select: ["id"]}))
        return !!(await this.playlistRepository.findOne({ where: { name: name, author: { id: userId }}, select: ["id"]}))
    }

    /**
     * Create new playlist if it does not exist
     * @param createPlaylistDto Playlist metadata
     * @param authentication Author entity (User)
     * @returns Playlist
     */
    public async createIfNotExists(createPlaylistDtos: CreatePlaylistDTO[], authentication: User): Promise<Playlist[]> {   
        const queryRunner = this.playlistRepository.manager.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const manager = queryRunner.manager;
            const repo = manager.getRepository(Playlist);

            const playlists = await repo.createQueryBuilder()
                .insert()
                .values(createPlaylistDtos.map((dto): Partial<Playlist> => {
                    return {
                        ...dto,
                        author: authentication,
                        slug: Slug.create(dto.name)
                    };
                }))
                .returning(["id"])
                .orUpdate(["name"], ["id"], { skipUpdateIfNoValuesChanged: false })
                .execute().then((insertResult) => {  
                    return repo.createQueryBuilder("playlist")
                    .leftJoin("playlist.author", "author").addSelect(["author.id", "author.slug", "author.name"])
                    .leftJoin("playlist.artwork", "artwork").addSelect(["artwork.id"])
                    .whereInIds(insertResult.raw)
                    .getMany();
                });

            await this.meilisearch.syncAndUpdateEntities(playlists.filter((p) => p.privacy == PlaylistPrivacy.PUBLIC), true, repo);
            await queryRunner.commitTransaction();
            return playlists;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException();
        }
    }

    public async update(playlistId: string, updatePlaylistDto: Partial<CreatePlaylistDTO>, authentication: User): Promise<Playlist> {
        const playlist = await this.findById(playlistId);

        if(!playlist) throw new NotFoundException("Playlist not found.")
        if(!await this.hasUserAccessToPlaylist(playlistId, authentication) || !await this.canEditPlaylist(playlist, authentication)) throw new ForbiddenException("Not allowed to edit this playlist.")
        if(await this.existsByNameAndUser(updatePlaylistDto.name, authentication.id, playlistId)) throw new BadRequestException("Playlist already exists.");
        
        playlist.name = updatePlaylistDto.name ?? playlist.name;
        playlist.privacy = updatePlaylistDto.privacy ?? playlist.privacy;
        playlist.description = updatePlaylistDto.description ?? playlist.description;

        return this.playlistRepository.createQueryBuilder().update()
            .set(playlist)
            .whereEntity(playlist)
            .execute().then((result) => {
                if(result.affected > 0) {
                    return playlist;

                }
                throw new BadRequestException("Did not update playlist");
            });
    }

    /**
     * Add a song to a playlist
     * @param playlistId Playlist's id
     * @param addSongDto Body of the request. Contains the song and if duplicates should be ignored
     * @param requester The user requesting the operation. Used to check if the user is allowed to add songs
     * @returns 
     */
    public async addSong(playlistId: string, addSongDto: AddSongDTO, authentication: User): Promise<PlaylistItemAddResult> {       
        // Check if user could theoretically access the playlist.
        if(!await this.hasUserAccessToPlaylist(playlistId, authentication)) {
            throw new NotFoundException("Playlist not found")
        }

        // Check if the playlist object
        // exists in the database
        const playlist: Playlist = await this.findById(playlistId);
        if(!playlist) throw new NotFoundException("Playlist not found");    

        const targetId = addSongDto.targetSongId;

        // Check if the playlist already contains the same song.
        // If the force flag was set, this will be ignored.
        if(!addSongDto.force && !!await this.containsSong(playlistId, targetId)) {
            return new PlaylistItemAddResult(targetId, true, PlaylistAddSongFailReason.DUPLICATE);
        }

        // Create new item object
        const item = new PlaylistItem();
        item.song = { id: targetId } as Song;
        item.playlist = { id: playlist.id } as Playlist;
        item.addedBy = { id: authentication.id } as User;

        // Save the relation
        return this.song2playlistRepository.save(item).then(() => {
            return new PlaylistItemAddResult(targetId, false);
        })
    }

    public async setSongs(playlistId: string, songs: Song[], authentication: User) {
        return this.song2playlistRepository.createQueryBuilder()
            .insert()
            .values(songs.map((song) => ({
                addedBy: authentication,
                playlist: { id: playlistId },
                song: song
            })))
            .orIgnore()
            .execute();
    }

    /**
     * Add a song to a playlist
     * @param playlistId Playlist's id
     * @param songId Song's id
     * @param requester The user requesting the operation. Used to check if the user is allowed to add songs
     * @returns 
     */
    public async removeSongs(playlistId: string, songIds: string[], authentication: User): Promise<Playlist> {
        /*if(!await this.hasUserAccessToPlaylist(playlistId, authentication)) {
            throw new NotFoundException("Playlist not found.")
        }

        const playlist: Playlist = await this.findPlaylistByIdWithSongs(playlistId);
        if(!playlist) throw new NotFoundException("Playlist does not exist.");

        if(!playlist.items) playlist.items = [];
        return this.song2playlistRepository.delete({ songId: In(songIds), playlistId }).then(() => {
            return playlist;
        }).catch(() => {
            return playlist;
        });*/
        throw new InternalServerErrorException();
    }

    /**
     * Delete a playlist by its id
     * @param playlistId Id of the playlist
     * @param authentication Authentication object
     * @returns True, if got deleted. Otherwise false
     */
    public async deleteById(playlistId: string, authentication?: User): Promise<boolean> {
        // Find the playlist by its id
        return this.findById(playlistId).then((playlist) => {
            // Check if null. If true, return 404
            if(isNull(playlist)) throw new NotFoundException("Playlist not found");
            // If authenticated user is not author, return 401
            if(playlist.author?.id != authentication?.id) throw new ForbiddenException("No permission");

            // Delete playlist
            return this.playlistRepository.delete(playlist.id).then((deleteResult) => deleteResult.affected > 0);
        });
    }

    private async hasUserAccessToPlaylist(playlistId: string, authentication: User): Promise<boolean> {
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.author", "author")

            .select(["playlist.id", "playlist.privacy", "author.id"])
            .where("playlist.id = :playlistId", { playlistId })
            .orWhere("playlist.slug = :playlistId", { playlistId })

            .getOne()

        if(!result) return false;
        if(result.privacy != PlaylistPrivacy.PRIVATE) return true;
        if(result.author?.id == authentication.id) return true;
        return false;
    }

    private async canEditPlaylist(playlist: Playlist, authentication: User): Promise<boolean> {
        return playlist?.author?.id == authentication?.id;
    }

    /**
     * Update the last synced attributes on resources.
     * This will update the lastSyncedAt and lastSyncedFlag attributes.
     * @param resources List of resources which should be affected by the change
     * @param flag Flag to set for all resources
     * @returns UpdateResult
     */
    public async setLastSyncedDetails(resources: Playlist[], flag: MeilisearchFlag): Promise<UpdateResult> {
        return this.playlistRepository.createQueryBuilder()
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
     * Build a general query for finding playlists.
     * This will include stats like has the user liked the playlist,
     * how many songs are included and the total duration.
     * @param {string} alias Alias
     * @param {User} authentication Authentication object
     * @returns {SelectQueryBuilder} Query Builder
     */
    private buildGeneralQuery(alias: string, authentication?: User): SelectQueryBuilder<Playlist> {
        return this.playlistRepository.createQueryBuilder(alias)
            .leftJoinAndSelect("playlist.artwork", "artwork")
            .leftJoin("playlist.author", "author").addSelect(["author.id", "author.slug", "author.name"])
            .leftJoin("author.artwork", "authorArtwork").addSelect(["authorArtwork.id"])
            .leftJoin("playlist.items", "items").leftJoin("items.song", "itemSong").addSelect("SUM(itemSong.duration)", "playlist_totalDuration")

            .loadRelationCountAndMap("playlist.liked", "playlist.likedBy", "likedBy", (qb) => qb.where("likedBy.userId = :userId", { userId: authentication?.id }))
            .loadRelationCountAndMap("playlist.songsCount", "playlist.items", "item")
            
            .groupBy("playlist.id");
    }

}
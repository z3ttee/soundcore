import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, Pageable } from 'nestjs-pager';
import { In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { SyncFlag } from '../meilisearch/interfaces/syncable.interface';
import { MeiliPlaylistService } from '../meilisearch/services/meili-playlist.service';
import { Song } from '../song/entities/song.entity';
import { SongService } from '../song/song.service';
import { User } from '../user/entities/user.entity';
import { AddSongDTO } from './dtos/add-song.dto';
import { CreatePlaylistDTO } from './dtos/create-playlist.dto';
import { UpdatePlaylistDTO } from './dtos/update-playlist.dto';
import { PlaylistAddSongFailReason, PlaylistItemAddResult } from './entities/playlist-item-added.entity';
import { PlaylistItem } from './entities/playlist-item.entity';
import { Playlist } from './entities/playlist.entity';
import { PlaylistPrivacy } from './enums/playlist-privacy.enum';

@Injectable()
export class PlaylistService {
    
    constructor(
        private readonly meiliClient: MeiliPlaylistService,
        private readonly songService: SongService,
        @InjectRepository(Playlist) private playlistRepository: Repository<Playlist>,
        @InjectRepository(PlaylistItem)  private song2playlistRepository: Repository<PlaylistItem>
    ) {}

    /**
     * Find a playlist by its id.
     * @param {string} playlistId Playlist's id.
     * @returns {Playlist} Playlist
     */
    public async findById(playlistId: string): Promise<Playlist> {
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoinAndSelect("playlist.author", "author")
            .where("playlist.id = :playlistId", { playlistId })
            .orWhere("playlist.slug = :playlistId", { playlistId })
            .getOne();

        return result;
    }

    /**
     * Finds a profile of a playlist including songs count and totalDuration.
     * @param playlistId Id of the playlist
     * @param requester User that requests information. Used to check if the user is allowed to access the playlist.
     * @returns Playlist
     */
    public async findPlaylistProfileById(playlistId: string, authentication: User): Promise<Playlist> {
        if(!await this.hasUserAccessToPlaylist(playlistId, authentication)) {
            throw new ForbiddenException("Cannot access this playlist.");
        }

        const result = await this.buildGeneralQuery("playlist", authentication)
            .where("playlist.id = :playlistId OR playlist.slug = :playlistId", { playlistId })
            .getOneOrFail();

        return result;
    }

    public async findPlaylistByIdWithInfo(playlistId: string): Promise<Playlist> {
        return this.playlistRepository.findOne({ where: { id: playlistId }, relations: ["artwork", "author", "collaborators"]})
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

    public async findPlaylistByIdWithCollaborators(playlistId: string): Promise<Playlist> {
        return this.playlistRepository.findOne({ where: { id: playlistId }, relations: ["collaborators", "author"]})
    }

    public async findPlaylistByIdWithRelations(playlistId: string): Promise<Playlist> {
        return this.playlistRepository.findOne({ where: { id: playlistId }, relations: ["artwork", "author", "collaborators", "items", "items.song"]})
    }

    /**
     * Find playlists by a set of given ids.
     * @param ids Set of playlist ids
     * @param authentication Authentication object
     * @returns Page<Playlist>
     */
    public async findByIds(ids: string[], authentication: User): Promise<Page<Playlist>> {
        const result = await this.buildGeneralQuery("playlist", authentication)
            .where("playlist.id IN(:ids)", { ids })
            .getManyAndCount();

        return Page.of(result[0], result[1], 0);
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

            .where("author.id = :authorId", { authorId: authentication.id })
            // .orWhere("collaborator.id = :userId", { userId: authentication.id })
            .orWhere("likedByUser.id = :userId", { userId: authentication.id })
            .andWhere("playlist.privacy != :privacy", { privacy: PlaylistPrivacy.PRIVATE })
            .getManyAndCount();

        return Page.of(result[0], result[1], 0);
    }

    /**
     * Find public playlists by an author.
     * @param authorId Author to lookup playlists for
     * @param pageable Page settings
     * @param authentication User authentication object to check playlist access
     * @returns Page<Playlist>
     */
    public async findByAuthor(authorId: string, pageable: Pageable, authentication: User): Promise<Page<Playlist>> {
        if(authorId == "@me" || authorId == authentication.id || authorId == authentication.slug) authorId = authentication.id;
        
        // TODO: Test on user profiles
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.author", "author")
            .leftJoin("playlist.artwork", "artwork")
            .leftJoin("playlist.collaborators", "collaborator")

            // Pagination
            .limit(pageable?.size || 30)
            .offset((pageable?.size || 30) * (pageable?.page || 0))

            // Count how many likes. This takes user's id in count
            .loadRelationCountAndMap("playlist.liked", "playlist.likedBy", "likedBy", (qb) => qb.where("likedBy.userId = :userId", { userId: authentication.id }))

            .addSelect(["author.id", "author.name", "author.slug", "artwork.id", "artwork.accentColor"])
            .where("author.id = :authorId OR author.slug = :authorId", { authorId: authorId })
            .orWhere("collaborator.id = :userId", { userId: authentication.id })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.page);
    }

    public async findByArtist(artistId: string, pageable: Pageable, authentication: User): Promise<Page<Playlist>> {
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.items", "item")
            .leftJoin("item.song", "song")
            .leftJoin("song.primaryArtist", "primaryArtist")

            // TODO: Include featured artists

            .leftJoinAndSelect("playlist.author", "author")
            .leftJoinAndSelect("playlist.artwork", "artwork")
            .leftJoin("playlist.collaborators", "collaborator")
            .leftJoin("playlist.likedBy", "likedByUser", "likedByUser.userId = :userId", { userId: authentication.id })

            // Pagination
            .limit(pageable?.size || 30)
            .offset((pageable?.size || 30) * (pageable?.page || 0))

            // Count how many likes. This takes user's id in count
            .loadRelationCountAndMap("playlist.liked", "playlist.likedBy", "likedBy", (qb) => qb.where("likedBy.userId = :userId", { userId: authentication.id }))

            .where("(primaryArtist.id = :primaryArtistId OR primaryArtist.slug = :primaryArtistId) AND (playlist.privacy = :privacy OR author.id = :authorId OR collaborator.id = :authorId OR (likedByUser.userId = :authorId AND playlist.privacy != 'private'))", { artistId: artistId, privacy: PlaylistPrivacy.PUBLIC.toString(), authorId: authentication.id })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.page);
    }

    public async findByGenre(genreId: string, pageable: Pageable, authentication: User): Promise<Page<Playlist>> {
        const result = await this.playlistRepository.createQueryBuilder("playlist")
            .leftJoin("playlist.author", "author")
            .leftJoin("playlist.artwork", "artwork")
            .leftJoin("playlist.items", "item")
            .leftJoin("item.song", "song")
            .leftJoin("song.genres", "genre")

            .addSelect(["artwork.id", "artwork.accentColor", "author.id", "author.name", "author.slug"])

            .offset(pageable.page * pageable.size)
            .limit(pageable.size)

            .where("genre.id = :genreId OR genre.slug = :genreId", { genreId })
            .getMany()

            // TODO: Check if user has access to playlist

        return Page.of(result, result.length, pageable.page);
    }

    public async existsByTitleInUser(title: string, userId: string, playlistId?: string): Promise<boolean> {
        if(playlistId) return !! (await this.playlistRepository.findOne({ where: { name: title, author: { id: userId }, id: Not(playlistId)}}))
        return !! (await this.playlistRepository.findOne({ where: { name: title, author: { id: userId }}}))
    }

    /**
     * Save a playlist entity.
     * @param playlist Entity data to be saved
     * @returns Playlist
     */
    public async save(playlist: Playlist): Promise<Playlist> {
        return this.playlistRepository.save(playlist).then((result) => {
            this.sync([result]);
            return result;
        });
    }

    /**
     * Create new playlist. This fails with 
     * @param createPlaylistDto Playlist metadata
     * @param author Author entity (User)
     * @throws BadRequestException if a playlist by its title already exists in user scope.
     * @returns Playlist
     */
    public async create(createPlaylistDto: CreatePlaylistDTO, authentication: User): Promise<Playlist> {
        if(await this.existsByTitleInUser(createPlaylistDto.title, authentication.id)) throw new BadRequestException("Playlist already exists.");

        const playlist = new Playlist();
        playlist.author = authentication;
        playlist.name = createPlaylistDto.title;
        playlist.description = createPlaylistDto.description;
        playlist.privacy = createPlaylistDto.privacy;

        return this.save(playlist);
    }

    public async update(playlistId: string, updatePlaylistDto: UpdatePlaylistDTO, authentication: User): Promise<Playlist> {
        const playlist = await this.findById(playlistId);

        if(!playlist) throw new NotFoundException("Playlist not found.")
        if(!await this.hasUserAccessToPlaylist(playlistId, authentication) || !await this.canEditPlaylist(playlist, authentication)) throw new ForbiddenException("Not allowed to edit this playlist.")
        if(await this.existsByTitleInUser(updatePlaylistDto.title, authentication.id, playlistId)) throw new BadRequestException("Playlist already exists.");
        
        playlist.name = updatePlaylistDto.title || playlist.name;
        playlist.privacy = updatePlaylistDto.privacy || playlist.privacy;
        playlist.description = updatePlaylistDto.description || playlist.description;

        return this.save(playlist);
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

    public async deleteById(playlistId: string, authentication?: User): Promise<boolean> {
        const playlist = await this.findById(playlistId);

        if(playlist.author?.id != authentication?.id) throw new ForbiddenException("Not allowed.");

        return this.meiliClient.deletePlaylist(playlist.id).then(() => {
            return this.playlistRepository.delete({ id: playlist?.id }).then(() => true);
        })
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
     * Update the sync flag of a playlist.
     * @param resources Id or object of the playlist
     * @param flag Updated sync flag
     * @returns Playlist
     */
     private async setSyncFlags(resources: Playlist[], flag: SyncFlag) {
        const ids = resources.map((user) => user.id);

        return this.playlistRepository.createQueryBuilder()
            .update({
                lastSyncedAt: new Date(),
                lastSyncFlag: flag
            })
            .where({ id: In(ids) })
            .execute();
    }

    /**
     * Synchronize the corresponding document on meilisearch.
     * @param resource Playlist data
     * @returns Playlist
     */
    public async sync(resources: Playlist[]) {
        return this.meiliClient.setPlaylists(resources).then(() => {
            return this.setSyncFlags(resources, SyncFlag.OK);
        }).catch(() => {
            return this.setSyncFlags(resources, SyncFlag.ERROR);
        });
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
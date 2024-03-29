import fs from "fs";
import sharp from "sharp";
import crypto from "node:crypto";
import path from "path";
import Vibrant from "node-vibrant";
import axios from "axios";
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { CreateArtworkDTO, CreateDownloadableArtworkDTO } from "../dtos/create-artwork.dto";
import { Artwork, ArtworkFlag, ArtworkID, ArtworkType, SongArtwork } from "../entities/artwork.entity";
import { Random } from "@tsalliance/utilities";
import { DeleteResult, Repository, SelectQueryBuilder } from "typeorm";
import { Artist } from "../../artist/entities/artist.entity";
import { Album } from "../../album/entities/album.entity";
import { Song } from "../../song/entities/song.entity";
import { Label } from "../../label/entities/label.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { TasksService } from "../../tasks/services/tasks.service";

@Injectable()
export class ArtworkService {
    private logger: Logger = new Logger(ArtworkService.name);

    constructor(
        @InjectRepository(Artwork) private readonly repository: Repository<Artwork>,
        @InjectRepository(SongArtwork) private readonly songArtworkRepo: Repository<SongArtwork>,

        private readonly fileSystem: FileSystemService,
        private readonly taskService: TasksService,
    ) {}

    /**
     * Get the repository used by the service
     * @returns Repository<Artwork>
     */
    public getRepository() {
        return this.repository;
    }

    /**
     * Find an artwork by its id.
     * @param artworkId 
     * @returns 
     */
    public async findById(artworkId: string): Promise<Artwork> {
        return this.repository.createQueryBuilder("artwork")
            .where("artwork.id = :artworkId", { artworkId })
            .getOne();
    }

    public async findByIds(ids: ArtworkID[]): Promise<Artwork> {
        return this.repository.createQueryBuilder("artwork")
            .whereInIds(ids)
            .getOne();
    }

    /**
     * Find an artwork or create it if it does not exist.
     * For finding the artwork, only the "name", "type" properties
     * of the createArtworkDto object are used.
     * Should always be called in separate process, as its blocking.
     * @param createArtworkDto Creation and Find options
     * @returns Artwork
     * @deprecated Use createIfNotExistsV2()
     */
    public async createIfNotExists<T extends CreateArtworkDTO = CreateArtworkDTO>(createArtworkDtos: T[], qb?: (query: SelectQueryBuilder<Artwork>, alias: string) => SelectQueryBuilder<Artwork> ): Promise<Artwork[]> {
        return this.repository.createQueryBuilder()
            .insert()
            .values(createArtworkDtos)
            .orUpdate(["dstType", "flag", "srcUrl"], ["id"], { skipUpdateIfNoValuesChanged: false })
            .returning(["id"])
            .execute().then((insertResult) => {
                const alias = "artwork";
                let query: SelectQueryBuilder<Artwork> = this.repository.createQueryBuilder(alias)
                    
                if(typeof qb === "function") {
                    query = qb(this.repository.createQueryBuilder(alias), alias);
                }
                    
                return query.whereInIds(insertResult.raw).getMany();
            })
    }

    public async createIfNotExistsV2<T extends Artwork = Artwork>(repository: Repository<T>, values: T[], overwrite: (keyof T)[], qb?: (query: SelectQueryBuilder<T>, alias: string) => SelectQueryBuilder<T> ): Promise<T[]> {
        return repository.createQueryBuilder()
            .insert()
            .values(values as any)
            .orUpdate(overwrite as any[], ["id"], { skipUpdateIfNoValuesChanged: false })
            .returning(["id"])
            .execute().then((insertResult) => {
                const alias = "artwork";
                let query: SelectQueryBuilder<T> = repository.createQueryBuilder(alias)
                    
                if(typeof qb === "function") {
                    query = qb(query, alias);
                }
                    
                return query.whereInIds(insertResult.raw).getMany();
            })
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for artist artworks.
     * Should always be called in separate process, as its blocking.
     * @param artist Artist's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     */
    public async createForArtistIfNotExists(artist: Artist, sourceUri: string): Promise<Artwork> {
        const name = artist.name;
        const type = ArtworkType.ARTIST;

        const dto = new CreateDownloadableArtworkDTO(
            this.createHash(`${name}:${type}`),
            sourceUri,
            type                
        );

        return this.createIfNotExists([dto])?.[0];
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for album artworks.
     * Should always be called in separate process, as its blocking.
     * @param album Album's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     */
    public async createForAlbumIfNotExists(album: Album, sourceUri: string): Promise<Artwork> {
        const name = `${album.name} ${album.primaryArtist?.name || Random.randomString(8)}`;
        const type = ArtworkType.ALBUM;

        const dto = new CreateDownloadableArtworkDTO(
            this.createHash(`${name}:${type}`),
            sourceUri,
            type                
        );

        return this.createIfNotExists([dto])?.[0];
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for label artworks.
     * Should always be called in separate process, as its blocking.
     * @param label Label's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     * @deprecated 
     */
    public async createForLabelIfNotExists(label: Label, sourceUri: string): Promise<Artwork> {
        const name = label.name;
        const type = ArtworkType.LABEL;

        const dto = new CreateDownloadableArtworkDTO(
            this.createHash(`${name}:${type}`),
            sourceUri,
            type                
        );

        return this.createIfNotExists([dto])?.[0]
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for distributor artworks.
     * Should always be called in separate process, as its blocking.
     * @param distributor Distributor's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     * @deprecated 
     */
    public async createForDistributorIfNotExists(distributor: Distributor, sourceUri: string): Promise<Artwork> {
        const name = distributor.name;
        const type = ArtworkType.DISTRIBUTOR;

        const dto = new CreateDownloadableArtworkDTO(
            this.createHash(`${name}:${type}`),
            sourceUri,
            type                
        );

        return this.createIfNotExists([dto])?.[0];
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for publisher artworks.
     * Should always be called in separate process, as its blocking.
     * @param publisher Publisher's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     * @deprecated 
     */
     public async createForPublisherIfNotExists(publisher: Publisher, sourceUri: string): Promise<Artwork> {
        const name = publisher.name;
        const type = ArtworkType.PUBLISHER;

        const dto = new CreateDownloadableArtworkDTO(
            this.createHash(`${name}:${type}`),
            sourceUri,
            type                
        );

        return this.createIfNotExists([dto])?.[0]
    }

    /**
     * Create artworks in the database that belong to a song. Those artworks have special attributes.
     * @param artworks Set of artworks to create
     * @param qb Custom select query to customize returned entities after creation
     */
    public async createForSongsIfNotExists(artworks: SongArtwork[], qb?: (query: SelectQueryBuilder<SongArtwork>, alias: string) => SelectQueryBuilder<SongArtwork> ): Promise<SongArtwork[]> {
        return this.createIfNotExistsV2(this.songArtworkRepo, artworks, ["flag"], qb);
    }

    /**
     * Check if there are aborted artworks.
     * @returns True or False
     */
    public async hasAbortedArtworks(): Promise<boolean> {
        return this.repository.createQueryBuilder("artwork")
            .where("artwork.flag = :flag", { flag: ArtworkFlag.ABORTED })
            .limit(1)
            .select(["artwork.id"])
            .getOne().then((artwork) => {
                return typeof artwork !== "undefined" && artwork != null;
            });
    }

    public createDTOForSong(song: Song): SongArtwork {
        const name = `${ArtworkService.createSongCoverNameSchema(song)}`;
        const type = ArtworkType.SONG;

        const artwork = this.songArtworkRepo.create();
        artwork.id = this.createHash(`${name}:${type}`);

        return artwork;
    }

    public createHash(input: string): string {
        return crypto.createHash("md5").update(input, "binary").digest("hex")
    }

    public static createSongCoverNameSchema(song: Song): string {
        if(!song) return null;

        const primaryArtistName = song.primaryArtist?.id || Random.randomString(8);      
        const album = song.album;

        if(typeof album != "undefined" && album != null) {
            return `${album.id}`
        }

        return `${song.id} ${primaryArtistName}`;
    }

    /**
     * Download an url into buffer.
     * @param url URL
     * @returns Buffer
     */
    public async downloadToBuffer(url: string): Promise<Buffer> {
        if(url.includes("default_avatar")) return null;

        return axios.get(url, { responseType: "arraybuffer" }).then((response) => {
            const buffer = Buffer.from(response.data, "binary");
            return buffer;
        })
    }

    /**
     * Read a buffer or file and write its contents to the artwork file.
     * @param bufferOrFile Buffer or filepath
     * @param artwork Destination artwork object
     * @returns Artwork
     */
    public async writeFromBufferOrFile(bufferOrFile: string | Buffer, artwork: ArtworkID): Promise<ArtworkID> {
        return new Promise((resolve, reject) => {
            const dstFile = this.fileSystem.resolveArtworkDir(artwork);
            let srcBuffer: Buffer;

            // Check if parameter is a buffer, if not
            // treat as file and read file into a buffer.
            if(!Buffer.isBuffer(bufferOrFile)) {
                srcBuffer = fs.readFileSync(bufferOrFile as string);
            } else {
                srcBuffer = bufferOrFile as Buffer;
            }

            // Create destination directory
            fs.mkdir(path.dirname(dstFile), { recursive: true }, (err, directory) => {
                if(err) {
                    this.logger.warn(`Could not write artwork to disk: Could not create directory '${directory}': ${err.message}`);
                    reject(err);
                    return;
                }

                // Read source file into buffer and convert to jpeg,
                // compress and resize it. This will write the result into dstFile path
                sharp(srcBuffer).jpeg({ force: true, quality: 80, chromaSubsampling: "4:4:4" }).resize(512, 512, { fit: "cover" }).toFile(dstFile, (err) => {
                    if(err) {
                        this.logger.warn(`Could not write artwork to disk: Failed while processing using sharp: ${err.message}`);
                        reject(err);
                        return;
                    }

                    resolve(artwork);
                })
            })
        })
    }

    /**
     * Extract the accent color from an artwork file.
     * @param idOrObject Artwork id or object to extract colors from
     * @returns ArtworkColors
     */
     public async extractAccentColor(artwork: Pick<Artwork, "id">): Promise<string> {
        if(!artwork) return null;
        const filepath = this.fileSystem.resolveArtworkDir(artwork);

        return new Promise((resolve, reject) => {
            fs.access(filepath, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                Vibrant.from(filepath).getPalette().then((palette) => {
                    resolve(palette?.Vibrant?.hex);
                }).catch((error) => {
                    reject(error);
                });
            });
        });
    }

    public async extractAndSetAccentColor(idOrObject: Artwork): Promise<string> {
        const artwork = await this.resolveArtwork(idOrObject);
        if(!artwork) return null;

        return this.extractAccentColor(artwork).then((color) => {
            return this.repository.update(artwork.id, { accentColor: color }).then(() => {
                return color;
            })
        })
    }

    public async saveAll(artworks: Artwork[]) {
        return this.repository.save(artworks);
    }

    /**
     * Delete an artwork by its id.
     * @param artworkId Artwork's id
     * @returns DeleteResult
     */
    public async deleteById(artworkId: string): Promise<DeleteResult> {
        return this.repository.delete({ id: artworkId });
    }

    /**
     * Create a readstream for an artwork and pipe it directly to the response.
     * @param artworkId Requested artwork's id.
     * @param response Response to pipe stream to.
     */
     public async streamArtwork(artworkId: string, response: Response): Promise<void> {
        const artwork = await this.findById(artworkId);
        if(!artwork) throw new NotFoundException("Could not find artwork.");

        return new Promise((resolve, reject) => {
            const filepath = this.fileSystem.resolveArtworkDir(artwork);

            fs.access(filepath, (err) => {
                if(err) {
                    reject(new NotFoundException("Could not find artwork file."));
                    return;
                }

                const stream = fs.createReadStream(filepath).pipe(response);
                stream.on("finish", () => resolve());
                stream.on("error", () => reject(new InternalServerErrorException("Failed reading artwork file.")));
            })
             
        }) 
    }

    /**
     * Update an artworks flag in the database.
     * @param artworkIds Artworks to set flag to
     * @param flag Flag to set
     * @returns Artwork
     */
    public async setFlags(artworkIds: string[], flag: ArtworkFlag): Promise<boolean> {
        if(artworkIds.length <= 0) return false;
        return this.repository.createQueryBuilder()
            .update()
            .set({ flag })
            .where("id IN (:artworkIds)", { artworkIds })
            .execute().then((updateResult) => updateResult.affected > 0);
    }

    /**
     * Resolve the parameter to an artwork entity.
     * If its a string, the parameter is considered an id and the matching
     * entry from the database will be returned.
     * If its an object, the parameter is considered the artwork object which
     * will just be returned.
     * @param idOrObject Id or Artwork object
     * @returns Artwork
     */
    private async resolveArtwork(idOrObject: string | Artwork): Promise<Artwork> {
        if(typeof idOrObject == "string") {
            return this.findById(idOrObject);
        }

        return idOrObject as Artwork;
    }


}
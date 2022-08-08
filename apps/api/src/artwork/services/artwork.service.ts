import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { CreateArtworkDTO } from "../dtos/create-artwork.dto";
import { Artwork, ArtworkColors, ArtworkFlag, ArtworkType } from "../entities/artwork.entity";
import fs from "fs";
import sharp from "sharp";
import path from "path";
import Vibrant from "node-vibrant";
import { Random, Slug } from "@tsalliance/utilities";
import axios from "axios";
import { DeleteResult, Repository } from "typeorm";
import { Artist } from "../../artist/entities/artist.entity";
import { Album } from "../../album/entities/album.entity";
import { Song } from "../../song/entities/song.entity";
import { Label } from "../../label/entities/label.entity";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { FileSystemService } from "../../filesystem/services/filesystem.service";

@Injectable()
export class ArtworkService {
    private logger: Logger = new Logger(ArtworkService.name);

    constructor(
        @InjectRepository(Artwork) private readonly repository: Repository<Artwork>,
        private readonly fileSystem: FileSystemService
    ) { }

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

    /**
     * Find an artwork by its name and type.
     * @param name Name of the artwork
     * @param type Type of the artwork
     * @returns Artwork
     */
    public async findByNameAndType(name: string, type: ArtworkType): Promise<Artwork> {
        return this.repository.createQueryBuilder("artwork")
            .where("artwork.name = :name AND artwork.type = :type", { name, type })
            .getOne();
    }

    /**
     * Find an artwork or create it if it does not exist.
     * For finding the artwork, only the "name", "type" properties
     * of the createArtworkDto object are used.
     * Should always be called in separate process, as its blocking.
     * @param createArtworkDto Creation and Find options
     * @returns Artwork
     */
    public async createIfNotExists(createArtworkDto: CreateArtworkDTO): Promise<Artwork> {
        createArtworkDto.name = `${Slug.format(createArtworkDto.name)}`;

        const existingArtwork = await this.findByNameAndType(createArtworkDto.name, createArtworkDto.type);
        if(existingArtwork) return existingArtwork;

        const artwork = this.repository.create();
        artwork.flag = ArtworkFlag.OK;
        artwork.name = createArtworkDto.name;
        artwork.type = createArtworkDto.type;

        return this.repository.createQueryBuilder()
            .insert()
            .values(artwork)
            .orIgnore()
            .execute().then((result) => {
                if(result.identifiers.length > 0) {
                    // If process has not specified a source to write from,
                    // then just return created artwork entity.
                    if(!createArtworkDto.fromSource) return artwork;
                    // Otherwise write to artwork
                    return this.writeFromBufferOrFile(createArtworkDto.fromSource, artwork);
                }
                return this.findByNameAndType(createArtworkDto.name, createArtworkDto.type).then((artwork) => artwork);
            }).catch((error) => {
                this.logger.error(`Could not create database entry for artwork: ${error.message}`, error.stack);
                return null
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
    public async createForArtistIfNotExists(artist: Artist, waitForLock = false, fromSource?: string | Buffer): Promise<Artwork> {
        return this.createIfNotExists({ name: artist.name, type: ArtworkType.ARTIST, fromSource });
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for album artworks.
     * Should always be called in separate process, as its blocking.
     * @param album Album's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     */
    public async createForAlbumIfNotExists(album: Album, waitForLock = false, fromSource?: string | Buffer): Promise<Artwork> {
        return this.createIfNotExists({ name: `${album.name} ${album.primaryArtist?.name || Random.randomString(8)}`, type: ArtworkType.ALBUM, fromSource })
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for label artworks.
     * Should always be called in separate process, as its blocking.
     * @param label Label's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     */
    public async createForLabelIfNotExists(label: Label, waitForLock = false, fromSource?: string | Buffer): Promise<Artwork> {
        return this.createIfNotExists({ name: `${label.name}`, type: ArtworkType.LABEL, fromSource })
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for distributor artworks.
     * Should always be called in separate process, as its blocking.
     * @param distributor Distributor's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     */
    public async createForDistributorIfNotExists(distributor: Distributor, waitForLock = false, fromSource?: string | Buffer): Promise<Artwork> {
        return this.createIfNotExists({ name: `${distributor.name}`, type: ArtworkType.DISTRIBUTOR, fromSource })
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for publisher artworks.
     * Should always be called in separate process, as its blocking.
     * @param publisher Publisher's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     */
     public async createForPublisherIfNotExists(publisher: Publisher, waitForLock = false, fromSource?: string | Buffer): Promise<Artwork> {
        return this.createIfNotExists({ name: `${publisher.name}`, type: ArtworkType.PUBLISHER, fromSource })
    }

    /**
     * Function that calls the native createIfNotExists() function but with 
     * preconfigured options to fit requirements for song artworks.
     * Should always be called in separate process, as its blocking.
     * @param song Song's data
     * @param fromSource (Optional) Filepath or buffer. If not set, no artwork will be written during creation.
     * @returns Artwork
     */
     public async createForSongIfNotExists(song: Song, waitForLock = false, fromSource?: string | Buffer): Promise<Artwork> {
        const primaryArtistName = song.primaryArtist?.name || Random.randomString(8);      
        const featuredArtistNames = song.featuredArtists.map((artist) => artist.name).join(" ") || "";
        return this.createIfNotExists({ name: `${song.name} ${primaryArtistName} ${featuredArtistNames}`, type: ArtworkType.SONG, fromSource })
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
    public async writeFromBufferOrFile(bufferOrFile: string | Buffer, artwork: Artwork): Promise<Artwork> {
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

                    // Analyze colors from image
                    this.getAccentColorFromArtwork(artwork).then((colors) => {
                        artwork.colors = colors;

                        // Save updated artwork with colors
                        this.repository.save(artwork).then((result) => {
                            resolve(result);
                        }).catch((error) => {
                            reject(error);
                        })
                    }).catch((error) => {
                        reject(error);
                    })
                })
            })
        })
    }

    /**
     * Extract the accent color from an artwork file.
     * @param idOrObject Artwork id or object to extract colors from
     * @returns ArtworkColors
     */
     public async getAccentColorFromArtwork(idOrObject: Artwork): Promise<ArtworkColors> {
        const artwork = await this.resolveArtwork(idOrObject);
        const filepath = this.fileSystem.resolveArtworkDir(artwork);

        return new Promise((resolve, reject) => {
            fs.access(filepath, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                Vibrant.from(filepath).getPalette().then((palette) => {
                    const colors = new ArtworkColors();
                    colors.vibrant = palette.Vibrant.hex;
                    colors.muted = palette.Muted.hex;
                    colors.darkMuted = palette.DarkMuted.hex;
                    colors.darkVibrant = palette.DarkVibrant.hex;
                    colors.lightMuted = palette.LightMuted.hex;
                    colors.lightVibrant = palette.LightVibrant.hex;
                    resolve(colors);
                }).catch((error) => {
                    reject(error);
                });
            });
        });
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
     * @param idOrObject Id or Artwork object
     * @param flag ArtworkFlag
     * @returns Artwork
     */
    private async setFlag(idOrObject: string | Artwork, flag: ArtworkFlag): Promise<Artwork> {
        const artwork = await this.resolveArtwork(idOrObject);

        // Check if the flag actually changed.
        // If not, do nothing and return.
        if(artwork.flag == flag) return artwork;

        // Update the flag
        artwork.flag = flag;
        return this.repository.save(artwork);
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
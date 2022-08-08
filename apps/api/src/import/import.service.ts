import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateImportDTO } from './dtos/create-import.dto';

import fs, { mkdirSync } from "fs";
import sanitize from 'sanitize-filename';

import ytdl from "ytdl-core";
import ytpl from 'ytpl';

import { Mount } from '../mount/entities/mount.entity';

import NodeID3 from 'node-id3';

import { ImportEntity } from './entities/import.entity';
import { User } from '../user/entities/user.entity';
import { exec } from 'child_process';
import pathToFfmpeg from 'ffmpeg-static';
import path from 'path';
import { ImportGateway } from './gateway/import.gateway';
import { CreateSpotifyImportDTO } from './dtos/create-spotify.dto';
import { SpotifyPlaylist } from './entities/spotify-song.entity';
import { SpotifyService } from './spotify/spotify.service';
import { MountService } from '../mount/services/mount.service';

@Injectable()
export class ImportService {
    private logger: Logger = new Logger(ImportService.name);

    constructor(
        private mountService: MountService,
        private importGateway: ImportGateway,
        private spotifyService: SpotifyService,
    ) {}

    public async createImport(createImportDto: CreateImportDTO, importer?: User): Promise<ImportEntity> {
        return null;
        // const downloadableUrl = createImportDto.url;
        // if(!ytdl.validateURL(downloadableUrl)) throw new BadRequestException("Not a valid youtube url.")

        // const mount: Mount = await this.mountService.findById(createImportDto.mountId || this.mountId);
        // if(!mount) throw new BadRequestException("Mount does not exist")

        // const info: ytdl.videoInfo = await ytdl.getInfo(createImportDto.url).catch((reason) => {
        //     console.error(reason)
        //     return null;
        // })

        // const title = createImportDto.title || info.videoDetails.title;
        // const file: MountedFile = new MountedFile("yt-import", `${sanitize(title)}.mp3`, mount);

        // const dstFilepath = this.storageService.buildFilepathNonIndex(file);

        // const dstDirectory = path.dirname(dstFilepath);
        // mkdirSync(dstDirectory, { recursive: true })

        // const importEntity = new ImportEntity();
        // importEntity.status = "preparing";
        // importEntity.downloadableUrl = downloadableUrl;
        // importEntity.metadata = {
        //     title: title.replace(/^(?:\[[^\]]*\]|\([^()]*\))\s*|\s*(?:\[[^\]]*\]|\([^()]*\))/gm, ""),
        //     duration: parseInt(info.videoDetails.lengthSeconds),
        //     thumbnail_url: info.videoDetails?.thumbnails[info.videoDetails.thumbnails.length - 1]?.url,
        //     description: info.videoDetails.description,
        //     youtubeUrl: createImportDto.url,
        //     artists: createImportDto.artists,
        //     albums: createImportDto.albums
        // }
        // importEntity.url = createImportDto.url;
        // importEntity.dstFilepath = dstFilepath;
        // importEntity.dstFilename = sanitize(info.videoDetails.title + ".mp3");
        // importEntity.importer = importer;

        // // TODO: Artwork for banner and song fail?!

        // setTimeout(() => {
        //     this.download(importEntity).then(async () => {
        //         const artworkBuffer = await this.artworkService.optimizeImageBuffer(await this.artworkService.downloadImageUrl(importEntity.metadata.thumbnail_url), "song");

        //         const tags: NodeID3.Tags = {
        //             title: importEntity.metadata.title.length >= 30 ? importEntity.metadata.title.slice(0, 30) : importEntity.metadata.title,
        //             album: createImportDto.albums[0],
        //             artist: createImportDto.artists.join("/"),
        //             image: {
        //                 mime: "image/jpg",
        //                 type: {
        //                     id: 3,
        //                     name: "front cover"
        //                 },
        //                 description: "",
        //                 imageBuffer: artworkBuffer
        //             }
        //         }

        //         if(importEntity.metadata.albums) tags.album = importEntity.metadata.albums.join("/")
        //         if(importEntity.metadata.artists) tags.artist = importEntity.metadata.artists.join("/")

        //         // Write id3 tags
        //         NodeID3.write(tags, importEntity.dstFilepath, (err) => {
        //             if(err){
        //                 importEntity.status = "errored";
        //                 this.logger.warn("Could not write id3 tags for import: " + importEntity.metadata.title)
        //                 console.error(err);
        //                 this.sendUpdate(importEntity)
        //                 return
        //             }

        //             setTimeout(() => {
        //                 // trigger indexing
        //                 this.indexService.createIndexIfNotExists(file, importer).then((index) => {
        //                     importEntity.upgradeIndex = index
        //                     importEntity.status = "upgradeIndex"

        //                     this.sendUpdate(importEntity)
        //                 }).catch((reason) => {
        //                     this.logger.warn("Could not import url " + createImportDto.url, reason)

        //                     if(reason?.message?.includes("similar")) {
        //                         importEntity.status = "duplicate"
        //                         this.sendUpdate(importEntity)
        //                     } else {
        //                         importEntity.status = "errored"
        //                         this.sendUpdate(importEntity)
        //                     }
                            
        //                 });
        //             }, 100)
        //         })
        //     }).catch((reason) => {
        //         this.logger.error("Import failed for " + importEntity.metadata.title + ": ", reason)

        //         importEntity.status = "errored"
        //         this.sendUpdate(importEntity)
        //     });
        // }, 100)

        // return importEntity;
    }

    private async download(importEntity: ImportEntity): Promise<void> {
        /*return new Promise((resolve, reject) => {
            const tmpFilepath = this.storageService.buildTmpFilepath();

            importEntity.status = "downloading"
            this.sendUpdate(importEntity)

            const downloadStream = ytdl(importEntity.downloadableUrl, {
                filter: "audioonly",
                quality: "highestaudio"
            })

            downloadStream.on('progress', (chunkSize: number, transfered: number, total: number) => {
                importEntity.status = "downloading"
                importEntity.downloadProgress = (transfered/total) * 100;

                this.sendProgressUpdate(importEntity)
            })

            // Download to tmp file
            const writeStream = downloadStream.pipe(fs.createWriteStream(tmpFilepath, { autoClose: true, flags: "w" }))

            downloadStream.on("error", (err) => {
                reject(err)
            })
            writeStream.on("error", (err) => {
                reject(err)
            })

            writeStream.on("finish", () => {
                // Convert video/webm to mp3 using ffmpeg
                exec(`${pathToFfmpeg} -i "${tmpFilepath}" -vn -ab 128k -ar 44100 -y "${importEntity.dstFilepath}"`, (error) => {
                    if(error) reject(error)
                    else resolve()
                })
            })
        })*/
    }

    /**
     * 
     */
    private async sendUpdate(value: ImportEntity): Promise<void> {
        this.importGateway.sendUpdateToImporter(value);
    }

    private async sendProgressUpdate(value: ImportEntity): Promise<void> {
        this.importGateway.sendDownloadProgressToImport(value);
    }

    public async createSpotifyImport(createImportDto: CreateSpotifyImportDTO, user: User): Promise<SpotifyPlaylist> {
        const playlistId = createImportDto.url.replace(/(https:\/\/open.spotify.com\/playlist\/)/gm, "").replace(/\?[\s\S]*$/gm, "");

        return this.spotifyService.findSpotifyPlaylistById(playlistId, user).then((playlist) => {
            return playlist;
        })
    }

}

import fs from "node:fs";

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';

import { StreamTokenService } from './stream-token.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Stream } from '../entities/stream.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { FileService } from '../../file/services/file.service';
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { Environment } from "@soundcore/common";
import { CreateStreamDTO } from "../dtos/create-stream.dto";
import { User } from "../../user/entities/user.entity";
import { Song } from "../../song/entities/song.entity";

@Injectable()
export class StreamService {
    private readonly logger = new Logger(StreamService.name);

    constructor(
        private readonly tokenService: StreamTokenService,
        private readonly fileService: FileService,
        private readonly fileSystem: FileSystemService,
        @InjectRepository(Stream) private readonly repository: Repository<Stream>,
    ){}

    public async createIfNotExists(createStreamDto: CreateStreamDTO) {
        const stream = new Stream();
        stream.listener = { id: createStreamDto.listenerId } as User;
        stream.song = { id: createStreamDto.songId } as Song;
        stream.shortToken = createStreamDto.shortToken;

        this.repository.createQueryBuilder()
            .insert()
            .orIgnore()
            .values(stream)
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length > 0) {
                    if(Environment.isDebug) {
                        this.logger.debug(`Successfully saved stream record for user ${createStreamDto.listenerId}`);
                    }
                } else {
                    this.logger.warn(`Failed saving stream record for user ${createStreamDto.listenerId} without throwing any errors. Perhaps an identical entry already exists?`);
                }
            }).catch((error: Error) => {
                this.logger.error(`Failed saving stream record for user ${createStreamDto.listenerId}: ${error.message}`, Environment.isDebug ? error.stack : undefined);
            })
    }

    public async findStreamableSongByToken(tokenValue: string, request: Request, response: Response) {
        const token = await this.tokenService.decodeToken(tokenValue).catch((error: Error) => {
            this.logger.error(`Failed decoding stream token: ${error.message}`, Environment.isDebug ? error.stack : undefined);
            throw new BadRequestException("Invalid stream token.");
        });

        return this.fileService.findBySongId(token.songId).then(async (file) => {
            if(!file) throw new NotFoundException("Song not found.");

            // Get file's path
            const filePath = this.fileSystem.resolveFilepath(file);

            // Get file stats
            let filesize = file.size;
            if(filesize <= 0) {
                // Try resolving the filesize by looking up file stats
                const stat = await this.fileSystem.stats(filePath).catch(() => null);
                filesize = stat?.size || 0;
            }

            let readableStream: fs.ReadStream;

            if(request.headers.range) {    
                if(Environment.isDebug) {
                    this.logger.debug(`Received "Content-Range" header. Serving file in requested range.`);
                }

                const range = request.headers.range;
                const parts = range.replace(/bytes=/, "").split("-");
                const partialstart = parts[0];
                const partialend = parts[1];
          
                const start = parseInt(partialstart, 10);
                const end = partialend ? parseInt(partialend, 10) : filesize-1;
                const chunksize = (end-start)+1;
                readableStream = fs.createReadStream(filePath, {start: start, end: end});
                
                response.writeHead(206, {
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + filesize,
                    'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                    'Content-Type': 'audio/mpeg'
                });
            } else {
                readableStream = fs.createReadStream(filePath)
            }

            if(!this.tokenService.isExpired(token)) {
                // If the internal expiry is still valid, create new stream record 
                // to track user's stream history
                this.createIfNotExists({
                    listenerId: token.userId,
                    songId: token.songId,
                    shortToken: token.shortToken
                });
            } else {
                this.logger.verbose(`Skipped saving stream record for user: Detected expired token.`);
            }

            // Pipe stream to response
            readableStream.pipe(response);
        });
    }

    public async clearStreamRecords() {
        const startTime = Date.now();
        const pivotDateMs = startTime - (1000*60*60*24*30);

        this.repository.delete({
            listenedAt: LessThanOrEqual(pivotDateMs)
        }).then((deleteResult) => {
            this.logger.log(`Cleared ${deleteResult.affected || 0} stream records from the database.`);
        }).catch((error: Error) => {
            this.logger.error(`Failed clearing stream records older than 30days: ${error.message}`, Environment.isDebug ? error.stack : undefined);
        });
    }

}

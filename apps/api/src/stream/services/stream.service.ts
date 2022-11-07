import fs from "node:fs";

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';

import { StreamTokenService } from './stream-token.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Stream } from '../entities/stream.entity';
import { Repository } from 'typeorm';
import { FileService } from '../../file/services/file.service';
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { Environment } from "@soundcore/common";

@Injectable()
export class StreamService {
    private readonly logger = new Logger(StreamService.name);

    constructor(
        private tokenService: StreamTokenService,
        private readonly fileService: FileService,
        private readonly fileSystem: FileSystemService,
        @InjectRepository(Stream) private readonly repository: Repository<Stream>,
    ){}

    public async increaseStreamCount(songId: string, listenerId: string) {
        const stream = await this.repository.findOne({ where: { songId, listenerId }}).catch(() => {
            return null;
        });

        if(!stream) {
            this.repository.save({ songId, listenerId }).catch(() => {
            return null;
            })
            return
        }
        
        stream.streamCount++;
        this.repository.save(stream).catch(() => {
            return null;
        })
    }

    public async findStreamableSongByToken(tokenValue: string, request: Request, response: Response) {
        const token = await this.tokenService.decodeToken(tokenValue).catch((error: Error) => {
            this.logger.error(`Failed decoding stream token: ${error.message}`, Environment.isDebug ? error.stack : undefined);
            throw new BadRequestException("Invalid stream token.");
        });

        return this.fileService.findBySongId(token.songId).then(async (file) => {
            if(!file) throw new NotFoundException("Song not found.");
            console.log(file);

            // Get file's path
            const filePath = this.fileSystem.resolveFilepath(file);
            console.log(filePath);

            // Get file stats
            let filesize = file.size;
            if(filesize <= 0) {
                // Try resolving the filesize by looking up file stats
                const stat = await this.fileSystem.stats(filePath).catch(() => null);
                filesize = stat?.size || 0;
            }

            let readableStream: fs.ReadStream;

            if(request.headers.range) {    
                const range = request.headers.range;
                const parts = range.replace(/bytes=/, "").split("-");
                const partialstart = parts[0];
                const partialend = parts[1];
          
                const start = parseInt(partialstart, 10);
                const end = partialend ? parseInt(partialend, 10) : filesize-1;
                const chunksize = (end-start)+1;
                readableStream = fs.createReadStream(filePath, {start: start, end: end});
      
                /*if(end/total >= 0.4) {
                  // TODO: Fix streamCount increasing if user is skipping in player.
                  // Currently, it works, but if the user uses the seeking functionality and not the whole data is retrieved
                  // The browser will send a new request with the appropriate range. This causes to reexcute this whole method
                  // and also increases the streamCount another time
                  this.increaseStreamCount(songId, listener.id);
                }*/
                
                response.writeHead(206, {
                    'Content-Range': 'bytes ' + start + '-' + end + '/' + filesize,
                    'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                    'Content-Type': 'audio/mpeg'
                });
            } else {
                readableStream = fs.createReadStream(filePath)
                readableStream.on("end", () => {
                  /*if(listener) {
                    this.increaseStreamCount(songId, listener.id);
                  }*/
                })
            }

            // Pipe stream to response
            readableStream.pipe(response);
        });
    }

}

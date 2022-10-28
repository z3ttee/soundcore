import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { SongService } from '../../song/song.service';

import { StreamTokenService } from './stream-token.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Stream } from '../entities/stream.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StreamService {

    constructor(
        private tokenService: StreamTokenService,
        private songService: SongService,
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

    public async findStreamableSongById(tokenValue: string, request: Request, response: Response) {
        // const token = await this.tokenService.decodeToken(tokenValue).catch((error: Error) => {
        //   console.error(error);
        //   throw new BadRequestException("Invalid token.")
        // });

        // const song = await this.songService.findByIdWithIndex(token.songId);
        // if(!song) throw new NotFoundException("Song not found.");

        // const filePath = this.storageService.buildFilepath(song.index);
    
        // const stat = await this.storageService.getFileStats(filePath);
        // if(!stat) throw new NotFoundException("Song not found.")
        // const total = stat.size;

        // let readableStream: fs.ReadStream;
    
        // if(request.headers.range) {    
        //   const range = request.headers.range;
        //   const parts = range.replace(/bytes=/, "").split("-");
        //   const partialstart = parts[0];
        //   const partialend = parts[1];
    
        //   const start = parseInt(partialstart, 10);
        //   const end = partialend ? parseInt(partialend, 10) : total-1;
        //   const chunksize = (end-start)+1;
        //   readableStream = fs.createReadStream(filePath, {start: start, end: end});

        //   /*if(end/total >= 0.4) {
        //     // TODO: Fix streamCount increasing if user is skipping in player.
        //     // Currently, it works, but if the user uses the seeking functionality and not the whole data is retrieved
        //     // The browser will send a new request with the appropriate range. This causes to reexcute this whole method
        //     // and also increases the streamCount another time
        //     this.increaseStreamCount(songId, listener.id);
        //   }*/
          
        //   response.writeHead(206, {
        //       'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        //       'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
        //       'Content-Type': 'audio/mpeg'
        //   });
        // } else {
        //   readableStream = fs.createReadStream(filePath)
        //   readableStream.on("end", () => {
        //     /*if(listener) {
        //       this.increaseStreamCount(songId, listener.id);
        //     }*/
        //   })
        // }

        // readableStream.pipe(response);
    }

}

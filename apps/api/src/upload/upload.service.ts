import { Injectable } from '@nestjs/common';
import { MountService } from '../mount/services/mount.service';
import { User } from '../user/entities/user.entity';
import { Formats } from './dto/formats.dto';

@Injectable()
export class UploadService {

    constructor(private mountService: MountService){}

    /**
     * Get a list of supported formats for image or audio files
     * @returns Formats
     */
    public async findSupportedFormats(): Promise<Formats> {
        return new Formats()
    }

    /**
     * Process an uploaded file by specific uploader.
     * @param file Uploaded file
     * @param uploader User that uploaded the file.
     * @returns Index
     */
    public async uploadAudio(file: Express.Multer.File, uploader: User): Promise<any> {
        // file.originalname = sanitize(file.originalname)
        // const mount = await this.mountService.findDefault();
        // if(!mount) throw new NotFoundException("Could not find default mount.");

        // if(!await (await this.findSupportedFormats()).audio.includes(file.mimetype)) throw new BadRequestException("Unsupported file format.")

        // return this.storageService.writeBufferToMount(mount, file.buffer, file.originalname).catch((error) => error).then((error) => {
        //     if(error) throw new InternalServerErrorException("Could not upload file: Unexpected error.");
        //     // TODO: return this.mountService.indexFile(new MountedFile(".", file.originalname, mount), uploader)
        //     return null;
        // });
        return null;
    }

}

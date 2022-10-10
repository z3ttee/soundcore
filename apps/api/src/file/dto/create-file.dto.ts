import { FileDTO } from "../../mount/dtos/file.dto";
import { Mount } from "../../mount/entities/mount.entity";

export class CreateFileDTO {

    constructor(
        public readonly fileDto: FileDTO,
        public readonly mount: Mount
    ) {}

}
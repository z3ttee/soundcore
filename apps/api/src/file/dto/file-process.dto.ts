import { FileDTO } from "../../mount/dtos/file.dto";
import { Mount } from "../../mount/entities/mount.entity";

export enum FileProcessType {

    DEFAULT = "default",
    FLAG_BASED = "flag_based"

}
export class FileProcessDTO {
    constructor(
        public readonly mount: Mount,
        public readonly files: FileDTO[],
        public readonly type: FileProcessType = FileProcessType.DEFAULT
    ) {}
}
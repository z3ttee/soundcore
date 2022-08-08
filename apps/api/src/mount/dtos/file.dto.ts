import Bull from "bull";
import { Mount } from "../entities/mount.entity";

export class FileDTO {

    public filename: string;
    public directory: string;
    public size?: number = 0;
    public mount: Mount;
    public bullJob?: Bull.Job;

}
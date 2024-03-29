import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PlaylistPrivacy } from "../../playlist/enums/playlist-privacy.enum";
import { User } from "../../user/entities/user.entity";
import { ImportReport } from "./import-report.entity";

export enum ImportTaskType {
    SPOTIFY_PLAYLIST = 0
}

export enum ImportTaskStatus {
    ENQUEUED = 0,
    PROCESSING = 1,
    OK = 2,
    ERRORED = 3,
    SERVER_ABORT = 4
}

@Entity()
@Index(["user", "url"], { unique: true })
export class ImportTask<P = any, S = any, R = any> {

    /**
     * DEFAULT ATTRIBUTES
     */
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: 254, nullable: false })
    public baseUrl: string;

    @Column({ length: 254, nullable: false })
    public url: string;

    @Column({ type: "smallint", nullable: false })
    public type: ImportTaskType;

    @Column({ type: "smallint", default: 0, nullable: true })
    public status: ImportTaskStatus;

    @Column({ type: "smallint", default: 0, nullable: true })
    public privacy: PlaylistPrivacy;

    @Column({ type: "json", nullable: true })
    public payload?: P;

    @Column({ type: "json", nullable: true })
    public stats?: S;

    @OneToOne(() => ImportReport, (report) => report.task, { nullable: true })
    public report?: ImportReport<R>;

    @CreateDateColumn()
    public createdAt: number;

    /**
     * RELATIONS
     */
    @ManyToOne(() => User, (user) => user.imports, { nullable: false, onDelete: "CASCADE" })
    public user: User;
    
}
import { Column } from "typeorm";

export enum MeilisearchFlag {
    NEVER = 0,
    OK = 1,
    FAILED = 2
}

export class MeilisearchInfo {

    @Column({ type: "enum", enum: MeilisearchFlag, default: MeilisearchFlag.NEVER })
    public flag: MeilisearchFlag;

    @Column({ nullable: true })
    public syncedAt: Date;

}
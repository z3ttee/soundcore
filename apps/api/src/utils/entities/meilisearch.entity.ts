import { Column } from "typeorm";

export enum MeilisearchFlag {
    NEVER = "never",
    OK = "ok",
    FAILED = "failed"
}

export class MeilisearchInfo {

    @Column({ type: "enum", enum: MeilisearchFlag, default: MeilisearchFlag.NEVER })
    public flag: MeilisearchFlag;

    @Column({ nullable: true })
    public syncedAt: Date;

}
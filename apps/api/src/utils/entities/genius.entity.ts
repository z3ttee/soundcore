import { Column } from "typeorm";

export enum GeniusFlag {
    NEVER = "never",
    OK = "ok",
    FAILED = "failed"
}

export class GeniusInfo {

    @Column({ type: "enum", enum: GeniusFlag, default: GeniusFlag.NEVER })
    public flag: GeniusFlag;

    @Column({ nullable: true })
    public id: string;

}
import { Column } from "typeorm";

export enum GeniusFlag {
    NEVER = 0,
    OK = 1,
    FAILED = 2
}

export class GeniusInfo {

    @Column({ type: "enum", enum: GeniusFlag, default: GeniusFlag.NEVER })
    public flag: GeniusFlag;

    @Column({ nullable: true })
    public id: string;

}
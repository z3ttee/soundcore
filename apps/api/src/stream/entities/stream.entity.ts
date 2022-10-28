import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Stream {

    @PrimaryColumn({ type: "varchar", name: "songId" })
    public songId: string;

    @PrimaryColumn({ type: "varchar", name: "listenerId" })
    public listenerId: string;

    @Column({ default: 1 })
    public streamCount: number;
    
    @ManyToOne(() => Song, s => s.streams, { onDelete: "CASCADE" })
    public song: Song;

    @ManyToOne(() => User, u => u.streams, { onDelete: "CASCADE" })
    public listener: User;

}
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Song } from "../../song/entities/song.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
@Index([ "song", "listener", "shortToken" ], { unique: true })
export class Stream {

    @PrimaryGeneratedColumn("uuid")
    public id: string;
    
    @ManyToOne(() => Song, s => s.streams, { onDelete: "CASCADE" })
    @JoinColumn()
    public song: Song;

    @ManyToOne(() => User, u => u.streams, { onDelete: "CASCADE" })
    @JoinColumn()
    public listener: User;

    @Column({ nullable: false, length: 36 })
    public shortToken: string;

    @CreateDateColumn()
    public listenedAt: number;

}
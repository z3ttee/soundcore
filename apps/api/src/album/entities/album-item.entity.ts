import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Song } from "../../song/entities/song.entity";
import { PlayableItem } from "../../utils/entities/playable-item.entity";
import { Album } from "./album.entity";

@Entity()
export class AlbumItem implements PlayableItem {

    @PrimaryGeneratedColumn("increment", { type: "bigint", unsigned: true })
    public id: bigint;

    @ManyToOne(() => Album, { nullable: false, onDelete: "CASCADE" })
    public album: Album;

    @ManyToOne(() => Song, { nullable: false, onDelete: "CASCADE" })
    public metadata: Song;

}
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Mount } from "../../mount/entities/mount.entity";

export enum ZoneStatus {
    UP = "up"
}

export enum ZoneEnv {
    DOCKER = "docker",
    STANDALONE = "standalone"
}

@Entity()
export class Zone  {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    public status: ZoneStatus;

    @Column({ nullable: false })
    public environment: ZoneEnv;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: true, type: "varchar" })
    public platform: NodeJS.Platform;

    @Column({ nullable: true, type: "varchar" })
    public arch: NodeJS.Architecture;

    @OneToMany(() => Mount, (mount) => mount.zone)
    public mounts: Mount[];

    @CreateDateColumn()
    public createdAt: number;

    @UpdateDateColumn()
    public updatedAt: number;

    public mountsCount?: number;
    public usedSpace?: number;

}
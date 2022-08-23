import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Zone {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: 254, nullable: false, unique: true })
    public deviceHostname: string;

    

}
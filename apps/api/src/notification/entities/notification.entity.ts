import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Notification {

    /**
     * Id of the notification.
     */
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    /**
     * Title of the notification
     */
    @Column({ length: 120 })
    public title: string;

    /**
     * Message of the notification.
     */
    @Column({ length: 254 })
    public message: string;

    /**
     * Set the notification as broadcast. This allows
     * all available users to read the notification.
     */
    @Column({ default: false })
    public isBroadcast: boolean;

    /**
     * List of users that have read the notification.
     * From a technical perspective, this means, the user
     * has requested the resource from one of the endpoints.
     */
    @ManyToMany(() => User)
    @JoinTable({ name: "readBy2notification" })
    public readBy: User[];

    /**
     * List of users that are targeted by the
     * notification. This will be overwritten by
     * the "isBroadcast" property, if set to true.
     */
    @ManyToMany(() => User) 
    @JoinTable({ name: "target2notification" })
    public targets: User[];

    /**
     * User who triggered the notification.
     * If the sender is null, it means the notification
     * was send by the system.
     */
    @ManyToOne(() => User)
    public sender: User;

    /**
     * Date of delivery of the notification.
     */
    @CreateDateColumn()
    public sentAt: Date;

    /**
     * Not a column in the database, but will be populated
     * when requesting resource via service.
     */
    public hasRead: boolean;
}
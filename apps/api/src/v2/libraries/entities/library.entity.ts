import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Library {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ type: "varchar", length: 8, nullable: true, unique: true })
  public slug: string;

  @Column({ type: "varchar", length: 64, nullable: true, unique: true })
  public name: string;

  @CreateDateColumn()
  public readonly createdAt: Date;

  @UpdateDateColumn()
  public readonly updatedAt: Date;
}

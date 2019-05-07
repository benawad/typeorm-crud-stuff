import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { User } from "./User";
import { SharedNote } from "./SharedNote";

@Entity()
export class Note extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  ownerId: number;
  @ManyToOne(() => User, user => user.notes)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @OneToMany(() => SharedNote, sharedNote => sharedNote.note)
  shares: SharedNote[];
}

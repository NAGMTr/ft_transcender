import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../../shared/enums/roles.enum";



@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!:         string;

    @Column({
        unique: true,
        nullable: false,
    })
    email!:      string;

    @Column()
    password!:   string;
    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role!:       Role;

    @Column({
        default: false,
    })
    state!:      boolean;

    @CreateDateColumn()
    created_at!: Date;

     @CreateDateColumn()
    updated_at!: Date;
}
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn,  } from "typeorm";

export enum UserRole{
    USER = 'user',
    ADMIN = 'admin',
}

@Entity('users')
export class UserEntity{

    @PrimaryGeneratedColumn()
    id!:number;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'text', nullable: true , select:false})
    password!: string | null;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole;

    @Column({type:'boolean', default:false})
    state!: boolean;

    @CreateDateColumn()
    created_at!:Date;

    @UpdateDateColumn()
    updated_at!:Date; 
}
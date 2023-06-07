import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 75, unique: true })
    email: string;

    @Column({ type: 'varchar', select: false })
    password: string;

    @Column({ type: 'varchar', length: 45 })
    fullName: string;

    @Column({ type: 'bool', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', array: true, default: ['user'] })
    roles: string[];
}

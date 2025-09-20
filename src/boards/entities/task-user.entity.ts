import { User } from "src/auth/entities/auth.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TaskUser {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @CreateDateColumn()
    assignedAt: Date;

    @ManyToOne(() => User, user => user.tasksUsers)
    user: User;
}
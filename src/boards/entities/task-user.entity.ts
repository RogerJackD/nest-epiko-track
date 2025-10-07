import { User } from "src/auth/entities/auth.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "./task.entity";

@Entity()
export class TaskUser {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @CreateDateColumn()
    assignedAt: Date;

    @ManyToOne(() => User, user => user.tasksUsers)
    user: User;

    @ManyToOne(() => Task, task => task.tasksUsers, {
        onDelete: 'CASCADE',
    })
    task: Task;
}
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Task {

    //todo : cambiar uuid a int en entidad board id 
    //todo analizar: en tablero colocar estados en base a sus columnas_? y relacionarlas a tasks

    @PrimaryGeneratedColumn('increment')
    id: number;

    //todo: idUsuario = usuario asignado a la tarea uno(usuario) a muchos(tareas)
    //userId: number;

    @Column({
        type: 'text',
    })
    title: string;

    @Column({
        type: 'text',
    })
    description: string;

    //cuando el usuario desea dejar como referencia cuando la tarea puede empezarse a hacerse
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    startDate: Date;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;

    //cuando el usuario marca como tarea cuando lo aprueba como completa
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    completedAt: Date;

    //cuando el usuario desea la fecha a vencer de la tarea 
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    dueDate: Date;

    @UpdateDateColumn({
        type: 'timestamp'
    })
    updatedAt: Date;

    



}
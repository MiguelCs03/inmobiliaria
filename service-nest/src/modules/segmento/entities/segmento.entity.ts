import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Cliente } from '../../cliente/entities/cliente.entity';

@ObjectType()
@Entity('segmento')
export class Segmento {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @OneToMany(() => Cliente, (cliente) => cliente.segmento)
  clientes!: Cliente[];
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Propiedad } from '../../propiedad/entities/propiedad.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Empleado } from '../../empleado/entities/empleado.entity';

@ObjectType()
@Entity('visita')
export class Visita {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'propiedad_id', type: 'bigint' })
  propiedadId!: number;

  @Field(() => Int)
  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId!: number;

  @Field(() => Int)
  @Column({ name: 'empleado_id', type: 'bigint' })
  empleadoId!: number;

  @Field(() => Date)
  @Column({ name: 'fecha_visita', type: 'timestamp' })
  fechaVisita!: Date;

  @ManyToOne(() => Propiedad, (propiedad) => propiedad.visitas)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad!: Propiedad;

  @ManyToOne(() => Cliente, (cliente) => cliente.visitas)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @ManyToOne(() => Empleado, (empleado) => empleado.visitas)
  @JoinColumn({ name: 'empleado_id' })
  empleado!: Empleado;
}
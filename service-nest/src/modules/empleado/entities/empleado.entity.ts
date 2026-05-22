import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Sucursal } from '../../sucursal/entities/sucursal.entity';
import { Visita } from '../../visita/entities/visita.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@ObjectType()
@Entity('empleado')
export class Empleado {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId!: number;

  @Field(() => Int)
  @Column({ name: 'sucursal_id' })
  sucursalId!: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  nombres!: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  apellidos!: string;

  @OneToOne(() => Usuario, (usuario) => usuario.empleado)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.empleados)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @OneToMany(() => Visita, (visita) => visita.empleado)
  visitas!: Visita[];

  @OneToMany(() => Contrato, (contrato) => contrato.empleado)
  contratos!: Contrato[];
}

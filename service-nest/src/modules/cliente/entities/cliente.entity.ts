import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Visita } from '../../visita/entities/visita.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@ObjectType()
@Entity('cliente')
export class Cliente {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId!: number | null;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  nombres!: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Field(() => String)
  @Column({ name: 'ci_nit', type: 'varchar', length: 30 })
  ciNit!: string;

  @OneToOne(() => Usuario, (usuario) => usuario.cliente)
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario | null;

  @OneToMany(() => Visita, (visita) => visita.cliente)
  visitas!: Visita[];

  @OneToMany(() => Contrato, (contrato) => contrato.cliente)
  contratos!: Contrato[];
}
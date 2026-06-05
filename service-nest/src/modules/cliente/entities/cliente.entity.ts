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
import { Visita } from '../../visita/entities/visita.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';
import { Segmento } from '../../segmento/entities/segmento.entity';
import { Preferencias } from '../../preferencias/entities/preferencias.entity';

@ObjectType()
@Entity('cliente')
export class Cliente {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId!: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'segmento_id', type: 'bigint', nullable: true })
  segmentoId!: number | null;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  nombres!: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Field(() => String)
  @Column({ name: 'ci_nit', type: 'varchar', length: 30 })
  ciNit!: string;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToOne(() => Usuario, (usuario) => usuario.cliente)
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario | null;

  @ManyToOne(() => Segmento, (segmento) => segmento.clientes)
  @JoinColumn({ name: 'segmento_id' })
  segmento?: Segmento | null;

  @OneToMany(() => Preferencias, (preferencias) => preferencias.cliente)
  preferencias!: Preferencias[];

  @OneToMany(() => Visita, (visita) => visita.cliente)
  visitas!: Visita[];

  @OneToMany(() => Contrato, (contrato) => contrato.cliente)
  contratos!: Contrato[];
}

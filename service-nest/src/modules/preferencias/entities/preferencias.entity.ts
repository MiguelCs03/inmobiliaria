import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Cliente } from '../../cliente/entities/cliente.entity';

@ObjectType()
@Entity('preferencias')
export class Preferencias {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId!: number;

  @Field(() => Float, { nullable: true })
  @Column({ name: 'presupuesto_max', type: 'decimal', precision: 12, scale: 2, nullable: true })
  presupuestoMax?: number | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'tipo_propiedad_buscada', type: 'varchar', length: 100, nullable: true })
  tipoPropiedadBuscada?: string | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'habitaciones_minimo', type: 'integer', nullable: true })
  habitacionesMinimo?: number | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'zona_preferida', type: 'varchar', length: 150, nullable: true })
  zonaPreferida?: string | null;

  @ManyToOne(() => Cliente, (cliente) => cliente.preferencias)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;
}

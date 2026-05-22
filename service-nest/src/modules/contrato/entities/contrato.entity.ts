import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Propiedad } from '../../propiedad/entities/propiedad.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { PlanPago } from './plan-pago.entity';

@ObjectType()
@Entity('contrato')
export class Contrato {
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

  @Field(() => Float)
  @Column({ name: 'monto_total', type: 'decimal', precision: 12, scale: 2 })
  montoTotal!: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'estado_contrato', type: 'varchar', length: 30, nullable: true })
  estadoContrato?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'documento_nosql_id', type: 'varchar', length: 50, nullable: true })
  documentoNosqlId?: string | null;

  @ManyToOne(() => Propiedad, (propiedad) => propiedad.contratos)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad!: Propiedad;

  @ManyToOne(() => Cliente, (cliente) => cliente.contratos)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @ManyToOne(() => Empleado, (empleado) => empleado.contratos)
  @JoinColumn({ name: 'empleado_id' })
  empleado!: Empleado;

  @OneToMany(() => PlanPago, (planPago) => planPago.contrato)
  planPagos!: PlanPago[];
}
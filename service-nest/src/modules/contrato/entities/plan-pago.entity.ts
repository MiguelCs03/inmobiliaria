import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import { Contrato } from './contrato.entity';
import { Factura } from './factura.entity';

export enum PlanPagoEstado {
  Pendiente = 'Pendiente',
  Pagado = 'Pagado',
}

// Decorador de GraphQL para definir este objeto en el esquema
@ObjectType()
@Entity('plan_pagos')
export class PlanPago {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'contrato_id', type: 'bigint' })
  contratoId!: number;

  @Field(() => Int)
  @Column({ name: 'nro_cuota', type: 'int' })
  nroCuota!: number;

  @Field(() => Float)
  @Column({ name: 'monto_cuota', type: 'decimal', precision: 12, scale: 2 })
  montoCuota!: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: PlanPagoEstado,
    default: PlanPagoEstado.Pendiente,
  })
  estado!: PlanPagoEstado;

  @ManyToOne(() => Contrato, (contrato) => contrato.planPagos)
  @JoinColumn({ name: 'contrato_id' })
  contrato!: Contrato;

  @Field(() => [Factura], { nullable: true })
  @OneToMany(() => Factura, (factura) => factura.planPago)
  facturas!: Factura[];
}


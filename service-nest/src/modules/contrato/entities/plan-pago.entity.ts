import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contrato } from './contrato.entity';
import { Factura } from './factura.entity';

export enum PlanPagoEstado {
  Pendiente = 'Pendiente',
  Pagado = 'Pagado',
}

@Entity('plan_pagos')
export class PlanPago {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'contrato_id', type: 'bigint' })
  contratoId!: number;

  @Column({ name: 'nro_cuota', type: 'int' })
  nroCuota!: number;

  @Column({ name: 'monto_cuota', type: 'decimal', precision: 12, scale: 2 })
  montoCuota!: number;

  @Column({
    type: 'enum',
    enum: PlanPagoEstado,
    default: PlanPagoEstado.Pendiente,
  })
  estado!: PlanPagoEstado;

  @ManyToOne(() => Contrato, (contrato) => contrato.planPagos)
  @JoinColumn({ name: 'contrato_id' })
  contrato!: Contrato;

  @OneToMany(() => Factura, (factura) => factura.planPago)
  facturas!: Factura[];
}

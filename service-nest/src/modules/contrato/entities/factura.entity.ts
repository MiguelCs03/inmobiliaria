import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanPago } from './plan-pago.entity';
import { Pago } from './pago.entity';

@Entity('factura')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'plan_pago_id' })
  planPagoId!: string;

  @Column({ name: 'nro_factura', type: 'varchar', length: 30, unique: true })
  nroFactura!: string;

  @Column({ name: 'monto_total', type: 'decimal', precision: 12, scale: 2 })
  montoTotal!: number;

  @Column({ name: 'fecha_emision', type: 'timestamp' })
  fechaEmision!: Date;

  @ManyToOne(() => PlanPago, (planPago) => planPago.facturas)
  @JoinColumn({ name: 'plan_pago_id' })
  planPago!: PlanPago;

  @OneToMany(() => Pago, (pago) => pago.factura)
  pagos!: Pago[];
}
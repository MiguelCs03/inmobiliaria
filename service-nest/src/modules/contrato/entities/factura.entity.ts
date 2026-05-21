import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contrato } from './contrato.entity';
import { Pago } from './pago.entity';

@Entity('factura')
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'contrato_id' })
  contratoId!: string;

  @Column({ name: 'nro_factura', type: 'varchar', length: 30, unique: true })
  nroFactura!: string;

  @Column({ name: 'monto_total', type: 'decimal', precision: 12, scale: 2 })
  montoTotal!: number;

  @Column({ name: 'fecha_emision', type: 'timestamp' })
  fechaEmision!: Date;

  @ManyToOne(() => Contrato, (contrato) => contrato.facturas)
  @JoinColumn({ name: 'contrato_id' })
  contrato!: Contrato;

  @OneToMany(() => Pago, (pago) => pago.factura)
  pagos!: Pago[];
}
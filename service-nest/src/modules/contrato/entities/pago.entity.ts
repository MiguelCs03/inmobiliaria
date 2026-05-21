import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Factura } from './factura.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'factura_id' })
  facturaId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  @Column({ type: 'varchar', length: 50 })
  metodo!: string; // 'QR' | 'Banco'

  @ManyToOne(() => Factura, (factura) => factura.pagos)
  @JoinColumn({ name: 'factura_id' })
  factura!: Factura;
}
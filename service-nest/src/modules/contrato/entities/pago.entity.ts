import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import { Factura } from './factura.entity';

// Decorador de GraphQL para definir este objeto en el esquema
@ObjectType()
@Entity('pago')
export class Pago {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'factura_id', type: 'bigint' })
  facturaId!: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  metodo!: string; // 'QR' | 'Banco' | 'Stripe'

  @ManyToOne(() => Factura, (factura) => factura.pagos)
  @JoinColumn({ name: 'factura_id' })
  factura!: Factura;
}
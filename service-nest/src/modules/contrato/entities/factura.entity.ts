import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import { PlanPago } from './plan-pago.entity';
import { Pago } from './pago.entity';

// Decorador de GraphQL para exponer este objeto en el esquema
@ObjectType()
@Entity('factura')
export class Factura {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'plan_pago_id', type: 'bigint' })
  planPagoId!: number;

  @Field(() => String)
  @Column({ name: 'nro_factura', type: 'varchar', length: 30, unique: true })
  nroFactura!: string;

  @Field(() => Float)
  @Column({ name: 'monto_total', type: 'decimal', precision: 12, scale: 2 })
  montoTotal!: number;

  @Field(() => Date)
  @Column({ name: 'fecha_emision', type: 'timestamp' })
  fechaEmision!: Date;

  // Nuevas columnas para la integración con SIAT
  @Field(() => String, { nullable: true })
  @Column({ name: 'cuf', type: 'varchar', length: 150, nullable: true })
  cuf?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'codigo_recepcion', type: 'varchar', length: 100, nullable: true })
  codigoRecepcion?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'estado_siat', type: 'varchar', length: 50, nullable: true })
  estadoSiat?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'nit_cliente', type: 'varchar', length: 30, nullable: true })
  nitCliente?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'razon_social', type: 'varchar', length: 255, nullable: true })
  razonSocial?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'cufd_usado', type: 'text', nullable: true })
  cufdUsado?: string | null;

  @ManyToOne(() => PlanPago, (planPago) => planPago.facturas)
  @JoinColumn({ name: 'plan_pago_id' })
  planPago!: PlanPago;

  @Field(() => [Pago], { nullable: true })
  @OneToMany(() => Pago, (pago) => pago.factura)
  pagos!: Pago[];
}
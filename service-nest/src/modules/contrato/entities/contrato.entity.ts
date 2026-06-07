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
import { FirmaContrato } from '../../firma_contrato/entities/firma_contraro.entity';

@ObjectType()
@Entity('contrato')
export class Contrato {

  //id del contrato
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  //id de la propiedad
  @Field(() => Int)
  @Column({ name: 'propiedad_id', type: 'bigint' })
  propiedadId!: number;

  //id del cliente
  @Field(() => Int)
  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId!: number;

  //id del agente
  @Field(() => Int)
  @Column({ name: 'empleado_id', type: 'bigint' })
  empleadoId!: number;

  //titulo del contrato
  @Field(() => String)
  @Column({
    name: 'titulo',
    type: 'varchar',
    length: 500
  })
  titulo!: string;

  //monto total del contrato acuerdo...
  @Field(() => Float)
  @Column({ name: 'monto_total', type: 'decimal', precision: 12, scale: 2 })
  montoTotal!: number;

  @Field(() => Date, { nullable: true })
  @Column({
    name: 'fecha_inicio',
    type: 'timestamp',
    nullable: true
  })
  fechaInicio?: Date | null;

  @Field(() => Date, { nullable: true })
  @Column({
    name: 'fecha_fin',
    type: 'timestamp',
    nullable: true
  })
  fechaFin?: Date | null;


  //observaciones del cotrato
  @Field(() => String, { nullable: true })
  @Column({
    name: 'observaciones',
    type: 'text',
    nullable: true
  })
  observaciones?: string | null;

  //lo nececesario para bloxchain
  //hash del documento
  @Field(() => String, { nullable: true })
  @Column({
    name: 'document_hash',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  documentHash?: string | null;
  //url pdf s3
  @Field(() => String, { nullable: true })
  @Column({
    name: 'pdf_url',
    type: 'text',
    nullable: true
  })
  pdfUrl?: string | null;
  //id blockchain

  @Field(() => String, { nullable: true })
  @Column({
    name: 'blockchain_contract_id',
    type: 'varchar',
    length: 100,
    nullable: true
  })
  blockchainContractId?: string | null;

  //estado del contrato
  @Field(() => String, { nullable: true })
  @Column({ name: 'estado_contrato', type: 'varchar', length: 30, nullable: true })
  estadoContrato?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ name: 'documento_nosql_id', type: 'varchar', length: 50, nullable: true })
  documentoNosqlId?: string | null;



  //aqui las relaciones con otras tablas
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
  @OneToMany(
    () => FirmaContrato,
    (firma) => firma.contrato,
  )
  @Field(
    () => [FirmaContrato],
    {
      nullable: true,
    },
  )
  firmas?: FirmaContrato[];
}
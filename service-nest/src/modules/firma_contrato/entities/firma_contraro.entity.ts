import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import {
  ObjectType,
  Field,
  Int,
} from '@nestjs/graphql';

import { Contrato } from '../../contrato/entities/contrato.entity';

@ObjectType()
@Entity('firma_contrato')
export class FirmaContrato {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int)
  @Column({
    name: 'contrato_id',
    type: 'bigint',
  })
  contratoId!: number;

  @Field(() => String)
  @Column({
    name: 'tipo_firmante',
    type: 'varchar',
    length: 20,
  })
  tipoFirmante!: string;

  @Field(() => String)
  @Column({
    name: 'signature_url',
    type: 'text',
  })
  signatureUrl!: string;

  @Field(() => Date)
  @Column({
    name: 'fecha_firma',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaFirma!: Date;

  @ManyToOne(
    () => Contrato,
    contrato => contrato.firmas,
  )
  @JoinColumn({
    name: 'contrato_id',
  })
  contrato!: Contrato;
}
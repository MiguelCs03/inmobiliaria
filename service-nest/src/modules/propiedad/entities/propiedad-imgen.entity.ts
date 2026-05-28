import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Propiedad } from './propiedad.entity';
import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('propiedad_imagen')
export class PropiedadImagen {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'propiedad_id', type: 'bigint' })
  propiedadId!: number;

  @Field(() => String)
  @Column({ name: 'url_s3', type: 'varchar', length: 255 })
  urlS3!: string;

  @Field(() => Boolean)
  @Column({ name: 'procesada_ia', type: 'boolean', default: false })
  procesadaIa!: boolean;

  @ManyToOne(() => Propiedad, (propiedad) => propiedad.imagenes)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad!: Propiedad;
}
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Propiedad } from '../../propiedad/entities/propiedad.entity';

@ObjectType()
@Entity('propietario')
export class Propietario {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  nombres!: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Field(() => String)
  @Column({ name: 'ci_nit', type: 'varchar', length: 30 })
  ciNit!: string;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Field(() => String, { nullable: true })
  @Column({ name: 'foto_url', type: 'varchar', length: 255, nullable: true })
  fotoUrl?: string | null;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.propietario)
  propiedades!: Propiedad[];
}
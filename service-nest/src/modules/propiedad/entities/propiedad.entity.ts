import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Propietario } from '../../propietario/entities/propietario.entity';
import { TipoPropiedad } from './tipo-propiedad.entity';
import { TipoOperacion } from './tipo-operacion.entity';
import { EstadoPropiedad } from './estado-propiedad.entity';
import { PropiedadImagen } from './propiedad-imgen.entity';
import { Visita } from '../../visita/entities/visita.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@ObjectType()
@Entity('propiedad')
export class Propiedad {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'propietario_id', type: 'bigint' })
  propietarioId!: number;

  @Field(() => Int)
  @Column({ name: 'tipo_propiedad_id' })
  tipoPropiedadId!: number;

  @Field(() => Int)
  @Column({ name: 'tipo_operacion_id' })
  tipoOperacionId!: number;

  @Field(() => Int)
  @Column({ name: 'estado_propiedad_id' })
  estadoPropiedadId!: number;

  @Field(() => Float)
  @Column({ name: 'precio_base', type: 'decimal', precision: 12, scale: 2 })
  precioBase!: number;

  @Field(() => Float)
  @Column({ name: 'area_m2', type: 'decimal', precision: 10, scale: 2 })
  areaM2!: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion?: string | null;

  @Column({ name: 'detalles_json', type: 'jsonb', nullable: true })
  detallesJson?: Record<string, any> | null;

  @ManyToOne(() => Propietario, (propietario) => propietario.propiedades)
  @JoinColumn({ name: 'propietario_id' })
  propietario!: Propietario;

  @ManyToOne(() => TipoPropiedad, (tipo) => tipo.propiedades)
  @JoinColumn({ name: 'tipo_propiedad_id' })
  tipoPropiedad!: TipoPropiedad;

  @ManyToOne(() => TipoOperacion, (tipo) => tipo.propiedades)
  @JoinColumn({ name: 'tipo_operacion_id' })
  tipoOperacion!: TipoOperacion;

  @ManyToOne(() => EstadoPropiedad, (estado) => estado.propiedades)
  @JoinColumn({ name: 'estado_propiedad_id' })
  estadoPropiedad!: EstadoPropiedad;

  @OneToMany(() => PropiedadImagen, (imagen) => imagen.propiedad)
  imagenes!: PropiedadImagen[];

  @OneToMany(() => Visita, (visita) => visita.propiedad)
  visitas!: Visita[];

  @OneToMany(() => Contrato, (contrato) => contrato.propiedad)
  contratos!: Contrato[];
}
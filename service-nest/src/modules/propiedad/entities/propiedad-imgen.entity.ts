import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Propiedad } from './propiedad.entity';

@Entity('propiedad_imagen')
export class PropiedadImagen {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'propiedad_id', type: 'bigint' })
  propiedadId!: number;

  @Column({ name: 'url_s3', type: 'varchar', length: 255 })
  urlS3!: string;

  @Column({ name: 'procesada_ia', type: 'boolean', default: false })
  procesadaIa!: boolean;

  @ManyToOne(() => Propiedad, (propiedad) => propiedad.imagenes)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad!: Propiedad;
}
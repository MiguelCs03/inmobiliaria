import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Propiedad } from './propiedad.entity';

@Entity('estado_propiedad')
export class EstadoPropiedad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.estadoPropiedad)
  propiedades!: Propiedad[];
}
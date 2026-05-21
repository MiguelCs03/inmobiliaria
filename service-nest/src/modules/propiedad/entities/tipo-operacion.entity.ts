import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Propiedad } from './propiedad.entity';

@Entity('tipo_operacion')
export class TipoOperacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.tipoOperacion)
  propiedades!: Propiedad[];
}
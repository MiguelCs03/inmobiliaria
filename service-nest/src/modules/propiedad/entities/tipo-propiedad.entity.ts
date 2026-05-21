import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Propiedad } from './propiedad.entity';

@Entity('tipo_propiedad')
export class TipoPropiedad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.tipoPropiedad)
  propiedades: Propiedad[];
}
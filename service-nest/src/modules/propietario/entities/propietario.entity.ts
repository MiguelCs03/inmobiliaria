import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Propiedad } from '../../propiedad/entities/propiedad.entity';

@Entity('propietario')
export class Propietario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombres!: string;

  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Column({ name: 'ci_nit', type: 'varchar', length: 30 })
  ciNit!: string;

  @OneToMany(() => Propiedad, (propiedad) => propiedad.propietario)
  propiedades!: Propiedad[];
}
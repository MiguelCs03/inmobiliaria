import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity('sucursal')
export class Sucursal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  ciudad: string;

  @OneToMany(() => Empleado, (empleado) => empleado.sucursal)
  empleados: Empleado[];
}
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Sucursal } from '../../sucursal/entities/sucursal.entity';
import { Visita } from '../../visita/entities/visita.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@Entity('empleado')
export class Empleado {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @Column({ name: 'sucursal_id' })
  sucursalId!: number;

  @Column({ type: 'varchar', length: 100 })
  nombres!: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos!: string;

  @OneToOne(() => Usuario, (usuario) => usuario.empleado)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.empleados)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal!: Sucursal;

  @OneToMany(() => Visita, (visita) => visita.empleado)
  visitas!: Visita[];

  @OneToMany(() => Contrato, (contrato) => contrato.empleado)
  contratos!: Contrato[];
}

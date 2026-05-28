import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Rol } from './rol.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'rol_id' })
  rolId!: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  correo!: string;

  @Column({ name: 'contrasenia_hash', type: 'varchar', length: 255 })
  contraseniaHash!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'foto_url', type: 'varchar', length: 255, nullable: true })
  fotoUrl?: string | null;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol;

  @OneToOne(() => Empleado, (empleado) => empleado.usuario, { nullable: true })
  empleado?: Empleado | null;

  @OneToOne(() => Cliente, (cliente) => cliente.usuario, { nullable: true })
  cliente?: Cliente | null;
}
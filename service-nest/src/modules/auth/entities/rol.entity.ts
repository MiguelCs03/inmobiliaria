import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string; // 'Admin' | 'Agente'

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];
}
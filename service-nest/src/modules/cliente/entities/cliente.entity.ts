import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Visita } from '../../visita/entities/visita.entity';
import { Contrato } from '../../contrato/entities/contrato.entity';

@Entity('cliente')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: string | null;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ name: 'ci_nit', type: 'varchar', length: 30 })
  ciNit: string;

  @OneToOne(() => Usuario, (usuario) => usuario.cliente)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Visita, (visita) => visita.cliente)
  visitas: Visita[];

  @OneToMany(() => Contrato, (contrato) => contrato.cliente)
  contratos: Contrato[];
}
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { propiedad } from '../../propiedad/entities/propiedad.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity('visita')
export class Visita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'propiedad_id' })
  propiedadId: string;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @Column({ name: 'empleado_id' })
  empleadoId: string;

  @Column({ name: 'fecha_visita', type: 'datetime' })
  fechaVisita: Date;

  @ManyToOne(() => Propiedad, (propiedad) => propiedad.visitas)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad: Propiedad;

  @ManyToOne(() => Cliente, (cliente) => cliente.visitas)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ManyToOne(() => Empleado, (empleado) => empleado.visitas)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;
}
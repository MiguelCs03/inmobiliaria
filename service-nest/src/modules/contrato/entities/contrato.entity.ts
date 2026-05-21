import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Propiedad } from '../../propiedad/entities/propiedad.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Factura } from './factura.entity';

@Entity('contrato')
export class Contrato {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'propiedad_id' })
  propiedadId!: string;

  @Column({ name: 'cliente_id' })
  clienteId!: string;

  @Column({ name: 'empleado_id' })
  empleadoId!: string;

  @Column({ name: 'monto_total', type: 'decimal', precision: 12, scale: 2 })
  montoTotal!: number;

  @Column({ name: 'documento_nosql_id', type: 'varchar', length: 50, nullable: true })
  documentoNosqlId?: string | null;

  @ManyToOne(() => Propiedad, (propiedad) => propiedad.contratos)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad!: Propiedad;

  @ManyToOne(() => Cliente, (cliente) => cliente.contratos)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @ManyToOne(() => Empleado, (empleado) => empleado.contratos)
  @JoinColumn({ name: 'empleado_id' })
  empleado!: Empleado;

  @OneToMany(() => Factura, (factura) => factura.contrato)
  facturas!: Factura[];
}
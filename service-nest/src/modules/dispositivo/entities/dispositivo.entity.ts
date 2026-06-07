import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Usuario } from '../../auth/entities/usuario.entity';

@ObjectType()
@Entity('dispositivo')
export class Dispositivo {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId?: number | null;

  @Field(() => String)
  @Column({ name: 'token_fcm', type: 'varchar', length: 255, unique: true })
  tokenFcm!: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  plataforma!: string;

  @Field(() => Date)
  @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro!: Date;

  // Clave foranea a la tabla usuario, permitiendo eliminacion en cascada y soporte de null para anonimos
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario | null;
}

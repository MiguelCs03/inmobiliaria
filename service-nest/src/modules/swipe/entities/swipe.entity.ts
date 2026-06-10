import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Propiedad } from '../../propiedad/entities/propiedad.entity';

@ObjectType()
@Entity('swipe')
export class Swipe {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Field(() => Int)
  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId!: number;

  @Field(() => Int)
  @Column({ name: 'propiedad_id', type: 'bigint' })
  propiedadId!: number;

  @Field(() => Boolean)
  @Column({ type: 'boolean' })
  like!: boolean;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Propiedad)
  @JoinColumn({ name: 'propiedad_id' })
  propiedad!: Propiedad;
}

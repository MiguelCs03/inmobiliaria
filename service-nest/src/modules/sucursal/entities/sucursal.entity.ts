import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Empleado } from '../../empleado/entities/empleado.entity';

@ObjectType()
@Entity('sucursal')
export class Sucursal {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  ciudad!: string;

  @OneToMany(() => Empleado, (empleado) => empleado.sucursal)
  empleados!: Empleado[];
}
import { Field, ObjectType } from '@nestjs/graphql';
import { Dispositivo } from '../entities/dispositivo.entity';

@ObjectType()
export class DispositivoResponse {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String)
  message!: string;

  // Los datos del dispositivo registrado se devuelven si la operacion fue exitosa
  @Field(() => Dispositivo, { nullable: true })
  data?: Dispositivo | null;
}

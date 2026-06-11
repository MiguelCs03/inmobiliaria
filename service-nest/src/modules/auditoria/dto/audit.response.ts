import { Field, ObjectType } from '@nestjs/graphql';
import { AuditLog } from './audit.dto';

@ObjectType()
export class AuditLogsResponse {

  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => [AuditLog])
  data!: AuditLog[];

}
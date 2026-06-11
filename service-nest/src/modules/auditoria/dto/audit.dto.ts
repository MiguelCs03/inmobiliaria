import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuditLog {

  @Field()
  id!: string;

  @Field()
  action!: string;

  @Field()
  entity!: string;

  @Field()
  entityId!: string;

  @Field()
  hash!: string;

  @Field()
  signature!: string;

  @Field()
  timestamp!: string;

}